import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import GroupsIcon from '@mui/icons-material/Groups'
import CakeIcon from '@mui/icons-material/Cake'
import LanguageIcon from '@mui/icons-material/Language'
import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router'
import dayjs from 'dayjs'
import { useClubData } from '@/query'
import { useEffect, useState } from 'react'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'

export default function ClubOverview() {
  const { data: club } = useClubData()
  const [loadImageError, setLoadImageError] = useState(false)

  useEffect(() => {
    if (club?.naam) {
      document.title = `${club.naam}`
    }
  }, [club?.naam])

  if (!club) return null

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <div className="flex flex-col items-center w-full gap-2">
        {!loadImageError
          ? (
              <img
                src={`https://assets.nevobo.nl/organisatie/logo/${club.organisatiecode}.jpg`}
                alt={`Logo van ${club.naam}`}
                className="max-w-full bg-white p-2 border border-panel-border rounded-2xl aspect-4/2 object-contain h-[100px]"
                height={100}
                onError={() => setLoadImageError(true)}
              />
            )
          : (
              <div className="max-w-full p-2 border border-panel-border rounded-2xl bg-white aspect-4/2 object-contain h-[100px] flex items-center justify-center">
                <SportsVolleyballIcon className="w-full h-full text-accent" />
              </div>
            )}
        <Typography variant="h5" fontWeight={600} fontSize={28}>
          {club.naam}
        </Typography>
      </div>
      <div className="flex flex-col w-full items-center border border-panel-border rounded-2xl p-2 bg-panel">
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <LocationPinIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            {club.vestigingsplaats}
            ,
            {' '}
            {club.provincie}
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <CakeIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
            Opgericht op
            {' '}
            {dayjs(club.oprichting).format('D MMMM YYYY')}
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <GroupsIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            {club.teams.length}
            {' '}
            Teams
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <LanguageIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
            <Link component={RouterLink} to={club.website} target="_blank" rel="noopener noreferrer">{club.website.split('://')[1]}</Link>
          </Stack>
        </Typography>
      </div>
      <iframe
        className="w-full h-[300px] border border-panel-border rounded-2xl bg-green-50"
        loading="lazy"
        allowFullScreen
        width="100%"
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC3_d8UM4kSe9Qui8C0l2FZ_zc2wGZNNVU&q=${encodeURIComponent(club.naam + ', ' + club.vestigingsplaats)}&zoom=9`}
      >
      </iframe>
    </div>
  )
}
