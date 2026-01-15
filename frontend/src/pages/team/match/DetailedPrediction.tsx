import PredictionsBarChart from '@/components/PredictionsBarChart'
import ChancesBarChart from './ChancesBarChart'
import { Typography } from '@mui/material'

export default function DetailedPrediction({ match }: { match: DetailedMatchInfo }) {
  if (match.status.waarde.toLowerCase() !== 'gepland') {
    return null
  }

  if (!match.prediction) {
    return (
      <Typography variant="body1" fontStyle="italic" color="textSecondary">
        Er is nog niet genoeg data om een voorspelling te maken voor deze wedstrijd.
      </Typography>
    )
  }

  const teamSide = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 0 ? 'left' : 'right'

  return (
    <>
      <ChancesBarChart match={match} />
      <PredictionsBarChart prediction={match.prediction!} teamSide={match.neutral ? null : teamSide} height={200} />
    </>
  )
}
