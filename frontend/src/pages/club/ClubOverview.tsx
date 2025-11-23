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

export default function ClubOverview() {
  const { data: club } = useClubData()

  if (!club) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
        <img
          src={`https://assets.nevobo.nl/organisatie/logo/${club.organisatiecode}.jpg`}
          alt={`Logo van ${club.naam}`}
          style={{ maxWidth: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '16px', backgroundColor: 'var(--color-panel)' }}
          height={100}
        />
        <Typography variant="h5" fontWeight={600} fontSize={28}>
          {club.naam}
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', border: '1px solid #ccc', borderRadius: '16px', padding: '0.5rem', backgroundColor: 'var(--color-panel)' }}>
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
        style={{ width: '100%', height: '300px', border: '1px solid #ccc', borderRadius: '16px' }}
        className="club-map"
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${club.breedtegraad},${club.lengtegraad}&z=9&hl=nl&output=embed`}
      >
      </iframe>
    </div>
  )
}
