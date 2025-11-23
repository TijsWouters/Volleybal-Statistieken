import { useEffect } from 'react'
import Standing from '@/components/Standing'
import '@/styles/team-standings.css'
import { useTeamData } from '@/query'

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
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {poulesToBeShown.slice().reverse().map(p => (
        <div key={p.poule}>
          <Standing framed poule={p} anchorTeam={data.fullTeamName} bt={data.bt[p.poule]} />
        </div>
      ))}
    </div>
  )
}
