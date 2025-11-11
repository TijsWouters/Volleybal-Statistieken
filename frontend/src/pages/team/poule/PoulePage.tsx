import { Paper, Typography } from '@mui/material'
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

export default function PoulePage() {
  const { data } = usePouleData()
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
        <hr />
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Standing poule={data} anchorTeam={data.fullTeamName} bt={data.bt} linkPoule={false} />
        </div>
      </Paper>
      <DataOverTime poule={data} />
      <TeamWinrates poule={data} />
      <PointShares poule={data} />
      <ResultShares poule={data} />
      <SurprisingResult poule={data} />
    </div>
  )
}
