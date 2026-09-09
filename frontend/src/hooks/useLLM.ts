const API = import.meta.env.VITE_API_URL || ''

import { getExpectedSetOutcome } from '@/pages/team/match/DetailedPrediction'
import { useQuery } from '@tanstack/react-query'

export function useMatchSummaryOrPreview(match: DetailedMatchInfo | null, locationName: string | null, resultStreaks: [string, string], llmEnabled: boolean) {
  return useQuery<LLMApiResponse>({
    queryKey: [match?.eindstand ? 'matchSummary' : 'matchPreview', match?.['@id']],
    retry: false,
    enabled: !!(llmEnabled && match && locationName),
    queryFn: async () => {
      if (!match) return null

      const teamIndex = match.teams.findIndex(t => t.omschrijving === match.fullTeamName)
      const normalizedTeamIndex = teamIndex === -1 ? 0 : teamIndex

      let data: MatchSummaryPromptData | MatchPreviewPromptData

      if (!match.eindstand) {
        data = {
          isPreview: true,
          teams: [match.teams[0].omschrijving, match.teams[1].omschrijving],
          expectedSetOutcome: getExpectedSetOutcome(match, normalizedTeamIndex),
          matchResultChances: match.prediction as Record<string, number>,
          previousResults: match.otherEncounters.filter(m => m.status.waarde === 'gespeeld').map((encounter) => {
            const needToFlip = encounter.teams[0].omschrijving === match.teams[1].omschrijving
            return needToFlip ? [encounter.eindstand![1], encounter.eindstand![0]] : encounter.eindstand!
          }),
          predictionIsAccurate: match.predictionReliable!,
          locationName: locationName!,
          resultsStreaks: resultStreaks,
          pouleName: match.pouleName,
        }
      }
      else {
        data = {
          isPreview: false,
          teams: [match.teams[0].omschrijving, match.teams[1].omschrijving],
          result: match.eindstand as [number, number],
          sets: match.setstanden ? match.setstanden.map(set => [set.puntenA, set.puntenB]) : [],
          expectedSetOutcome: getExpectedSetOutcome(match, normalizedTeamIndex),
          matchResultChances: match.prediction as Record<string, number>,
          predictionIsAccurate: match.predictionReliable! && resultStreaks[0].length > 1 && resultStreaks[1].length > 1,
          locationName: locationName!,
          resultsStreaks: resultStreaks,
          pouleName: match.pouleName,
        }
      }

      try {
        const response = await fetch(`${API}/llm/match-summary-or-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          return null
        }

        const result = await response.json()
        return result.summary
      }
      catch (error) {
        console.error('Error fetching match summary:', error)
        throw error
      }
    },
  })
}
