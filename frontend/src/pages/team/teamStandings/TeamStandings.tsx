import { useContext, useEffect } from 'react'
import { Paper, Typography, Stack, Divider } from '@mui/material'
import { TeamContext } from '../TeamRoutes'
import Standing from '@/components/Standing'
import '@/styles/team-standings.css'
import BackLink from '@/components/BackLink'

export default function TeamStandings() {
  const data = useContext(TeamContext)
  useEffect(() => {
    document.title = `Standen - ${data.fullTeamName}`
  }, [])

  const poulesToBeShown = data.poules.filter(p => p.standberekening !== false)

  return (
    <Paper elevation={4} className="team-standings fade-in">
      <BackLink to={`/team/${data.clubId}/${data.teamType}/${data.teamId}`} text={'Terug naar ' + data?.fullTeamName} />
      <Typography variant="h2" sx={{ textAlign: 'center' }}>Standen</Typography>
      <Typography variant="h5" sx={{ textAlign: 'center' }}>{data?.fullTeamName}</Typography>
      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />
      <Stack spacing={2} sx={{ maxWidth: '100%' }}>
        {poulesToBeShown.slice().reverse().map(p => <Standing key={p.poule} poule={p} anchorTeam={data.fullTeamName} bt={data.bt[p.poule]} />)}
      </Stack>
    </Paper>
  )
}
