import PredictionsBarChart from '@/components/PredictionsBarChart'
import ChancesBarChart from './ChancesBarChart'
import { Typography } from '@mui/material'
import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'
import { sigmoid } from '@/statistics-utils/bradley-terry'

export default function DetailedPrediction({ match }: { match: DetailedMatchInfo }) {
  if (match.status.waarde.toLowerCase() !== 'gepland' && match.status.waarde.toLowerCase() !== 'concept') {
    return null
  }

  const teamIndex = match.teams.findIndex(t => t.omschrijving === match.fullTeamName)
  const normalizedTeamIndex = teamIndex === -1 ? 0 : teamIndex
  const teamSide = normalizedTeamIndex === 0 ? 'left' : 'right'
  const expectedSetOutcome = getExpectedSetOutcome(match, normalizedTeamIndex)

  return (
    <>
      { !match.predictionReliable && (
        <Typography variant="body1" align="center" fontStyle="italic" color="textSecondary" className="dark:text-white opacity-90 mb-2">
          De voorspelling is niet betrouwbaar, omdat er onvoldoende gegevens beschikbaar zijn.
        </Typography>
      )}
      <ChancesBarChart match={match} />
      <PredictionsBarChart prediction={match.prediction!} teamSide={match.neutral ? null : teamSide} height={200} />
      <Typography variant="body1" align="center" className="dark:text-white">
        Voorspelde gemiddelde setstand:
        {' '}
        {expectedSetOutcome}
      </Typography>
    </>
  )
}

export function getExpectedSetOutcome(match: DetailedMatchInfo, teamIndex: number): string {
  const method = PUNTENTELMETHODES.find(m => m['@id'] === match.puntentelmethode)
  const pointsPerSet = method?.minimumPuntenReguliereSet || 25
  const pointChance = sigmoid(match.strengthDifference!)
  const pointChanceTeamA = teamIndex === 0 ? pointChance : 1 - pointChance
  const winnerIsA = pointChanceTeamA >= 0.5
  const winnerPointChance = winnerIsA ? pointChanceTeamA : 1 - pointChanceTeamA
  const rawLoserPoints = pointsPerSet * (1 - winnerPointChance) / winnerPointChance
  const loserPoints = Math.min(pointsPerSet - 2, Math.max(0, Math.round(rawLoserPoints)))
  return winnerIsA ? `${pointsPerSet}-${loserPoints}` : `${loserPoints}-${pointsPerSet}`
}
