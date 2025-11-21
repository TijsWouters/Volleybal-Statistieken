import { ButtonGroup, Button } from '@mui/material'
import { usePouleData } from '@/query'
import Standing from '@/components/Standing'
import TeamWinrates from './TeamWinrates'
import '@/styles/poule.css'
import PointShares from './PointShares'
import { useEffect } from 'react'
import ResultShares from './ResultShares'
import Loading from '@/components/Loading'
import DataOverTime from './DataOverTime'
import SurprisingResult from './SurprisingResult'
import { useState } from 'react'
import EndPositionChances from './EndPositionChances'
import ConsistencyScores from './ConsistencyScores'
import AccordionEntry from '@/components/AccordionEntry'
import TimelineIcon from '@mui/icons-material/Timeline';

type Metric = 'current' | 'predicted'

export default function PoulePage() {
  const { data } = usePouleData()
  const [metric, setMetric] = useState<Metric>('current')

  useEffect(() => {
    if (data) document.title = `Poule - ${data.name}`
  }, [data?.name])

  if (!data) {
    return <Loading />
  }

  return (
    <div className="poule-page" style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%', gap: '1rem' }}>
      <div style={{ padding: '1rem' }}>
        {data.bt.canPredictAllMatches() && data.matches.some(m => !m.eindstand)
          ? (
            <ButtonGroup variant="outlined" className="select-metric-button-group">
              <Button variant={metric === 'current' ? 'contained' : 'outlined'} onClick={() => setMetric('current')}>Huidig</Button>
              <Button variant={metric === 'predicted' ? 'contained' : 'outlined'} onClick={() => setMetric('predicted')}>Voorspelling</Button>
            </ButtonGroup>
          )
          : null}
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Standing poule={{ ...data, teams: metric === 'predicted' ? data.predictedEndResults : data.teams }} anchorTeam={data.fullTeamName} bt={data.bt} framed={false} />
        </div>
      </div>
      <div>
        <AccordionEntry title="Data over tijd" IconComponent={TimelineIcon}>
          <DataOverTime poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Eindpositie kansen" IconComponent={TimelineIcon}>
          <EndPositionChances poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Winpercentages" IconComponent={TimelineIcon}>
          <TeamWinrates poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Puntverdeling" IconComponent={TimelineIcon}>
          <PointShares poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Resultaatverdeling" IconComponent={TimelineIcon}>
          <ResultShares poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Consistentiescores" IconComponent={TimelineIcon}>
          <ConsistencyScores poule={data} />
        </AccordionEntry>
        <AccordionEntry title="Verrassende resultaten" IconComponent={TimelineIcon}>
          <SurprisingResult poule={data} />
        </AccordionEntry>
      </div>
    </div>
  )
}

function buildSummary(data: DetailedPouleInfo) {
  const lines = [
    `📈 Bekijk statistieken voor de poule ${data.name} van ${data.fullTeamName}`,
  ].join('\n')
  return {
    text: lines + '\n',
    url: window.location.href,
  }
}
