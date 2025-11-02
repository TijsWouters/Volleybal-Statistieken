import { Paper, Typography } from '@mui/material'
import { usePouleData } from '@/query'
import Standing from '@/components/Standing'
import TeamWinrates from './TeamWinrates'
import '@/styles/poule.css'

export default function PoulePage() {
  const { data } = usePouleData()

  return (
    <div className="poule-page" style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%', gap: '1rem' }}>
      <Paper elevation={4} style={{ maxWidth: '100%' }}>
        <Typography variant="h4">Poule</Typography>
        <hr />
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Standing poule={data} anchorTeam={data.fullTeamName} bt={data.bt} linkPoule={false} />
        </div>
      </Paper>
      <TeamWinrates poule={data} />
    </div>
  )
}
