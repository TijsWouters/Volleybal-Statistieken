import { useMatchData } from '@/query'
import Match from '@/components/Match'
import Loading from '@/components/Loading'
import { useEffect } from 'react'
import DetailedPrediction from './DetailedPrediction'
import '@/styles/match.css'
import Result from './Result'
import SetPerformance from './SetPerformance'
import RouteToLocation from './RouteToLocation'
import OtherEncounters from './OtherEncounters'
import InsightsIcon from '@mui/icons-material/Insights'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ScoreboardIcon from '@mui/icons-material/Scoreboard'
import TimelineIcon from '@mui/icons-material/Timeline'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import AccordionEntry from '@/components/AccordionEntry'

export default function MatchPage() {
  const data = useMatchData()

  useEffect(() => {
    if (data) document.title = `Wedstrijd ${data!.teams[0].omschrijving} - ${data!.teams[1].omschrijving}`
  }, [data])

  if (!data) {
    return <Loading />
  }

  return (
    <div className="flex flex-col gap-4 items-center max-w-full">
      <Match match={data!} framed={false} teamName={data!.fullTeamName!} result={data?.status.waarde.toLowerCase() === 'gespeeld'} teamLinks={true} pouleLink={data!.pouleLink} />
      <div className="w-full" style={{ viewTransitionName: 'slide-card' }}>
        {!data.eindstand && data.prediction && (
          <AccordionEntry title="Voorspelling" IconComponent={InsightsIcon}>
            <DetailedPrediction match={data} />
          </AccordionEntry>
        )}
        {data.eindstand && data.setstanden && (
          <AccordionEntry title="Setstanden" IconComponent={ScoreboardIcon}>
            <Result match={data} />
          </AccordionEntry>
        )}
        {data.eindstand && data.setstanden && (
          <AccordionEntry title="Setperformance" IconComponent={TimelineIcon}>
            <SetPerformance match={data} />
          </AccordionEntry>
        )}
        {data.otherEncounters.length > 0 && (
          <AccordionEntry title="Andere ontmoetingen" IconComponent={ListAltIcon}>
            <OtherEncounters match={data} />
          </AccordionEntry>
        )}
        {data.sporthal && (
          <AccordionEntry title="Locatie & Route" IconComponent={LocationPinIcon}>
            <RouteToLocation match={data} />
          </AccordionEntry>
        )}
      </div>
    </div>
  )
}
