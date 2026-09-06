import { LLMOutput } from '@/components/LLMOutput'
import { useMatchSummaryOrPreview } from '@/hooks/useLLM'
import { useRouteData, useTeamData, type Data } from '@/query'
import { useContext } from 'react'
import { SettingsContext } from '@/App'

export default function MatchSummaryOrPreview({ match }: { match: DetailedMatchInfo }) {
  const routeData = useRouteData()
  const teamData = useTeamData()
  const { llmEnabled } = useContext(SettingsContext)

  const resultsStreaks = extractResultStreaks(match, teamData.data!)

  const summary = useMatchSummaryOrPreview(match, routeData.data?.locationData.naam || null, resultsStreaks, llmEnabled)

  if (!llmEnabled) {
    return null
  }

  const loadingText = match.eindstand ? 'Samenvatting wordt gegenereerd...' : 'Voorbeschouwing wordt gegenereerd...'

  return (
    <LLMOutput text={summary.data?.text} model={summary.data?.model} loadingText={loadingText} />
  )
}

const extractResultStreaks = (match: DetailedMatchInfo, teamInfo: Data): [string, string] => {
  const teams = match.teams.map(t => t.omschrijving)

  console.log(match, teamInfo)
  const relevantPoule = teamInfo.poules.find(p => p.poule === match.poule)

  const relevantMatches = relevantPoule?.matches.filter((m) => {
    const matchTeams = m.teams.map(t => t.omschrijving)
    return (matchTeams.includes(teams[0]) || matchTeams.includes(teams[1])) && m.eindstand
  })

  const resultsStreaks = ['', '']

  for (const m of relevantMatches || []) {
    const matchTeams = m.teams.map(t => t.omschrijving)
    if (matchTeams.includes(teams[0])) {
      const teamIndex = matchTeams.indexOf(teams[0])
      const result = m.eindstand![teamIndex] > m.eindstand![1 - teamIndex] ? 'w' : 'l'
      resultsStreaks[0] += m['@id'] === match['@id'] ? result.toUpperCase() : result
    }
    if (matchTeams.includes(teams[1])) {
      const teamIndex = matchTeams.indexOf(teams[1])
      const result = m.eindstand![teamIndex] > m.eindstand![1 - teamIndex] ? 'w' : 'l'
      resultsStreaks[1] += m['@id'] === match['@id'] ? result.toUpperCase() : result
    }
  }

  console.log(resultsStreaks)

  return resultsStreaks as [string, string]
}
