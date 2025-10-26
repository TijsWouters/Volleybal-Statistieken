import { useMatchData } from '@/query'
import { useParams } from 'react-router'
import Match from '@/components/Match'
import Loading from '@/components/Loading'
import { Paper, Typography } from '@mui/material'
import { useEffect } from 'react'
import BackLink from '@/components/BackLink'
import DetailedPrediction from './DetailedPrediction'
import '@/styles/match.css'

export default function MatchPage() {
  const { clubId, teamType, teamId, matchUuid } = useParams<{ clubId: string, teamType: string, teamId: string, matchUuid: string }>()
  const { data, isLoading } = useMatchData(clubId!, teamType!, teamId!, matchUuid!)

  useEffect(() => {
    if (data) document.title = `Wedstrijd ${data!.teams[0].omschrijving} - ${data!.teams[1].omschrijving}`
  }, [data])

  if (isLoading || !data) {
    return <Loading />
  }

  return (
    <div className="match-page">
      <Paper elevation={4}>
        <BackLink to={`/team/${clubId}/${teamType}/${teamId}`} text={`Terug naar ${data.fullTeamName}`} />
        <Typography variant="h3" component="h1">Wedstrijd</Typography>
        <hr />
        <Match match={data!} teamName={data!.fullTeamName!} result={data?.status.waarde.toLowerCase() === 'gespeeld'} withPredictionOrSets={false} />
      </Paper>
      <DetailedPrediction match={data!} />
    </div>
  )
}
