import { useEffect } from 'react'
import Standing from '@/components/Standing'
import '@/styles/team-standings.css'
import { useTeamData } from '@/query'
import { Typography } from '@mui/material'
import EventBusyIcon from '@mui/icons-material/EventBusy'

export default function TeamStandings() {
  const { data } = useTeamData()
  useEffect(() => {
    document.title = `Standen - ${data?.fullTeamName}`
  }, [data])

  if (!data) {
    return null
  }

  const poulesToBeShown = data.poules.filter(p => p.standberekening !== false && !p.teruggetrokken)

  if (poulesToBeShown.length === 0) {
    return (
      <div className="flex flex-col grow w-full justify-center items-center text-black opacity-80 dark:text-white">
        <EventBusyIcon className="text-[60vmin]" />
        <Typography
          variant="h6"
          className="px-4 text-center"
          sx={{
            textAlign: 'center',
          }}
        >
          Er zijn geen standen gevonden.
        </Typography>
      </div>
    )
  }

  return (
    <>
      <Typography
        variant="body1"
        className="mt-4"
        sx={{
          fontWeight: 300,
          textAlign: 'center',
        }}
      >
        Klik op een poule voor meer informatie
      </Typography>
      <div className="p-4 flex flex-col gap-4">
        {poulesToBeShown.slice().reverse().map(p => (
          <div key={p.poule}>
            <Standing framed poule={p} anchorTeam={data.fullTeamName} bt={data.bt[p.poule]} />
          </div>
        ))}
      </div>
    </>
  )
}
