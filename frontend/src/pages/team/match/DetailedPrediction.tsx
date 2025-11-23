import PredictionsBarChart from '@/components/PredictionsBarChart'
import ChancesBarChart from './ChancesBarChart'

export default function DetailedPrediction({ match }: { match: DetailedMatchInfo }) {
  if (match.status.waarde.toLowerCase() !== 'gepland' || !match.prediction) {
    return null
  }

  const teamSide = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 0 ? 'left' : 'right'

  return (
    <>
      <ChancesBarChart match={match} />
      <PredictionsBarChart prediction={match.prediction!} teamSide={match.neutral ? null : teamSide} height={200} />
    </>
  )
}
