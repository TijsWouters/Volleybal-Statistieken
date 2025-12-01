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
import TimelineIcon from '@mui/icons-material/Timeline'
import CasinoIcon from '@mui/icons-material/Casino'
import PercentIcon from '@mui/icons-material/Percent'
import ScoreboardIcon from '@mui/icons-material/Scoreboard'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import BalanceIcon from '@mui/icons-material/Balance'
import PlusOneIcon from '@mui/icons-material/PlusOne'

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
    <div>
      <div className="p-4">
        {data.bt.canPredictAllMatches() && data.matches.some(m => !m.eindstand)
          ? (
              <ButtonGroup variant="outlined" className="select-metric-button-group">
                <Button variant={metric === 'current' ? 'contained' : 'outlined'} onClick={() => setMetric('current')}>Huidig</Button>
                <Button variant={metric === 'predicted' ? 'contained' : 'outlined'} onClick={() => setMetric('predicted')}>Voorspelling</Button>
              </ButtonGroup>
            )
          : null}
        <div className="max-w-full overflow-x-auto">
          <Standing poule={{ ...data, teams: metric === 'predicted' ? data.predictedEndResults : data.teams }} anchorTeam={data.fullTeamName} bt={data.bt} framed={false} />
        </div>
      </div>
      <div style={{ viewTransitionName: 'slide-card' }}>
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Data over tijd" IconComponent={TimelineIcon}>
            <DataOverTime poule={data} />
          </AccordionEntry>
        )}
        {data.bt.canPredictAllMatches() && data.matches.some(m => !m.eindstand) && (
          <AccordionEntry title="Eindpositie kansen" IconComponent={CasinoIcon}>
            <EndPositionChances poule={data} />
          </AccordionEntry>
        )}
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Winpercentages" IconComponent={PercentIcon}>
            <TeamWinrates poule={data} />
          </AccordionEntry>
        )}
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Puntverdeling" IconComponent={PlusOneIcon}>
            <PointShares poule={data} />
          </AccordionEntry>
        )}
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Resultaatverdeling" IconComponent={ScoreboardIcon}>
            <ResultShares poule={data} />
          </AccordionEntry>
        )}
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Consistentiescores" IconComponent={BalanceIcon}>
            <ConsistencyScores poule={data} />
          </AccordionEntry>
        )}
        {data.matches.some(m => m.eindstand) && (
          <AccordionEntry title="Verrassende resultaten" IconComponent={QuestionMarkIcon}>
            <SurprisingResult poule={data} />
          </AccordionEntry>
        )}
      </div>
    </div>
  )
}
