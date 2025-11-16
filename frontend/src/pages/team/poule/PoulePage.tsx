import { ButtonGroup, Button, Paper, Typography } from '@mui/material'
import { usePouleData } from '@/query'
import Standing from '@/components/Standing'
import TeamWinrates from './TeamWinrates'
import '@/styles/poule.css'
import PointShares from './PointShares'
import BackLink from '@/components/BackLink'
import { useEffect } from 'react'
import ResultShares from './ResultShares'
import Loading from '@/components/Loading'
import DataOverTime from './DataOverTime'
import SurprisingResult from './SurprisingResult'
import ShareButton from '@/components/ShareButton'
import { useState } from 'react'
import EndPositionChances from './EndPositionChances'
import ConsistencyScores from './ConsistencyScores'

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
      <Paper elevation={4} style={{ maxWidth: '100%' }}>
        <BackLink to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/standings`} text={`Terug naar standen (${data.fullTeamName})`} />
        <Typography variant="h3">Poule</Typography>
        <ShareButton summary={buildSummary(data)} />
        <hr />
        <ButtonGroup variant="outlined" className="select-metric-button-group">
          <Button variant={metric === 'current' ? 'contained' : 'outlined'} onClick={() => setMetric('current')}>Huidig</Button>
          <Button variant={metric === 'predicted' ? 'contained' : 'outlined'} onClick={() => setMetric('predicted')}>Voorspelling</Button>
        </ButtonGroup>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Standing poule={{ ...data, teams: metric === 'predicted' ? data.predictedEndResults : data.teams }} anchorTeam={data.fullTeamName} bt={data.bt} linkPoule={false} />
        </div>
      </Paper>
      <DataOverTime poule={data} />
      <EndPositionChances poule={data} />
      <TeamWinrates poule={data} />
      <PointShares poule={data} />
      <ResultShares poule={data} />
      <ConsistencyScores poule={data} />
      <SurprisingResult poule={data} />
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
