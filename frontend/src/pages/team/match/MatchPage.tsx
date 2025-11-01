import { useMatchData } from '@/query'
import { useParams } from 'react-router'
import Match from '@/components/Match'
import Loading from '@/components/Loading'
import { Button, Paper, Typography } from '@mui/material'
import { useEffect } from 'react'
import BackLink from '@/components/BackLink'
import DetailedPrediction from './DetailedPrediction'
import '@/styles/match.css'
import Result from './Result'
import SetPerformance from './SetPerformance'
import RouteToLocation from './RouteToLocation'
import ShareIcon from '@mui/icons-material/Share'
import dayjs from 'dayjs'
import OtherEncounters from './OtherEncounters'

export default function MatchPage() {
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string, matchUuid: string }>()
  const { data, isLoading } = useMatchData()

  useEffect(() => {
    if (data) document.title = `Wedstrijd ${data!.teams[0].omschrijving} - ${data!.teams[1].omschrijving}`
  }, [data])

  if (isLoading || !data) {
    return <Loading />
  }

  function handleShare() {
    navigator.share(buildSummary(data!))
  }

  const backLinkTo = `/team/${clubId}/${teamType}/${teamId}/${data.status.waarde.toLowerCase() === 'gespeeld' ? 'results' : 'program'}`
  const backLinkText = `Terug naar ${data.status.waarde.toLowerCase() === 'gespeeld' ? 'uitslagen' : 'programma'} (${data.fullTeamName})`

  return (
    <div className="match-page">
      <Paper elevation={4}>
        <BackLink to={backLinkTo} text={backLinkText} />
        <Typography variant="h3" component="h1">Wedstrijd</Typography>
        {navigator.canShare(buildSummary(data!)) && (
          <Button className="share-button" variant="contained" color="primary" startIcon={<ShareIcon />} onClick={handleShare}>
            Delen
          </Button>
        )}
        <hr />
        <Match match={data!} teamName={data!.fullTeamName!} result={data?.status.waarde.toLowerCase() === 'gespeeld'} withPredictionOrSets={false} teamLinks={true} />
      </Paper>
      <DetailedPrediction match={data!} />
      <Result match={data!} />
      <SetPerformance match={data!} />
      <OtherEncounters match={data!} />
      <RouteToLocation match={data!} />
    </div>
  )
}

function buildSummary(match: DetailedMatchInfo) {
  const lines = [
    `🏐 ${match.teams[0].omschrijving} - ${match.teams[1].omschrijving}`,
    `📅 ${dayjs(match.datum).format('ddd D MMM YYYY')}`,
    `⏰ ${dayjs(match.tijdstip).format('HH:mm')}`,
    `📍 ${match.location.naam}, ${match.location.adres.plaats}`,
  ]

  const numberEmojies = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

  if (match.status.waarde.toLowerCase() === 'gespeeld') {
    lines.push(`🏆 Uitslag: ${match.eindstand![0]} - ${match.eindstand![1]}`)
    for (const set of match.setstanden!) {
      lines.push(`${numberEmojies[set.set]} ${set.puntenA} - ${set.puntenB}`)
    }
  }
  else if (match.prediction) {
    const teamIndex = match.teams[0].omschrijving === match.fullTeamName ? 0 : 1
    lines.push('🔮 Voorspelling:')
    for (const [result, chance] of Object.entries(match.prediction)) {
      lines.push(`${parseInt(result.split('-')[teamIndex]) > parseInt(result.split('-')[(teamIndex + 1) % 2]) ? '🟩' : '🟥'} ${result}: ${chance.toFixed(1)}%`)
    }
  }

  return {
    text: lines.join('\n') + '\n',
    url: window.location.href,
  }
}
