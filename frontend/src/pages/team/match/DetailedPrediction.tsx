import { Paper, Typography } from '@mui/material'
import PredictionsBarChart from '@/components/PredictionsBarChart'
import ChancesBarChart from './ChancesBarChart'

export default function DetailedPrediction({ match }: { match: DetailedMatchInfo }) {
  if (match.status.waarde.toLowerCase() !== 'gepland' || !match.prediction) {
    return null
  }

  const teamSide = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 0 ? 'left' : 'right'

  return (
    <Paper elevation={4}>
      <Typography variant="h4" component="h2">Voorspelling</Typography>
      <hr />
      <ChancesBarChart match={match} />
      <PredictionsBarChart prediction={match.prediction!} teamSide={teamSide} height={200} />
    </Paper>
  )
}
