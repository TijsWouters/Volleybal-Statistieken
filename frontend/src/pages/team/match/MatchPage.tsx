import { useMatchData } from '@/query'
import Match from '@/components/Match'
import Loading from '@/components/Loading'
import { useEffect } from 'react'
import DetailedPrediction from './DetailedPrediction'
import '@/styles/match.css'
import Result from './Result'
import SetPerformance from './SetPerformance'
import RouteToLocation from './RouteToLocation'
import dayjs from 'dayjs'
import OtherEncounters from './OtherEncounters'
import InsightsIcon from '@mui/icons-material/Insights';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import AccordionEntry from '@/components/AccordionEntry'

export default function MatchPage() {
  const { data, isLoading } = useMatchData()

  useEffect(() => {
    if (data) document.title = `Wedstrijd ${data!.teams[0].omschrijving} - ${data!.teams[1].omschrijving}`
  }, [data])

  if (isLoading || !data) {
    return <Loading />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', maxWidth: '100%' }}>
      <Match match={data!} framed={false} teamName={data!.fullTeamName!} result={data?.status.waarde.toLowerCase() === 'gespeeld'} withPredictionOrSets={false} teamLinks={true} />
      <div style={{ width: '100%' }}>
        {!data.eindstand && (<AccordionEntry title="Voorspelling" IconComponent={InsightsIcon}>
          <DetailedPrediction match={data} />
        </AccordionEntry>)}
        {data.eindstand && (<AccordionEntry title="Setstanden" IconComponent={ScoreboardIcon}>
          <Result match={data} />
        </AccordionEntry>)}
        {data.eindstand && (<AccordionEntry title="Setperformance" IconComponent={TimelineIcon}>
          <SetPerformance match={data} />
        </AccordionEntry>)}
        <AccordionEntry title="Andere ontmoetingen" IconComponent={ListAltIcon}>
          <OtherEncounters match={data} />
        </AccordionEntry>
        <AccordionEntry title="Locatie" IconComponent={LocationPinIcon}>
          <RouteToLocation match={data} />
        </AccordionEntry>
      </div>
    </div >
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
