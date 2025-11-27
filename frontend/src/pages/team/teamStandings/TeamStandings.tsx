import { useEffect } from 'react'
import Standing from '@/components/Standing'
import '@/styles/team-standings.css'
import { useTeamData } from '@/query'
import { Typography } from '@mui/material'

export default function TeamStandings() {
  const { data } = useTeamData()
  useEffect(() => {
    document.title = `Standen - ${data?.fullTeamName}`
  }, [data])

  if (!data) {
    return null
  }

  const poulesToBeShown = data.poules.filter(p => p.standberekening !== false)

  return (
    <>
      <Typography variant="body1" fontWeight={300} textAlign="center" style={{ marginTop: '1rem' }}>
        Klik op een poule voor meer informatie
      </Typography>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {poulesToBeShown.slice().reverse().map(p => (
          <div key={p.poule}>
            <Standing framed poule={p} anchorTeam={data.fullTeamName} bt={data.bt[p.poule]} />
          </div>
        ))}
      </div>
    </>
  )
}
