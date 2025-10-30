import { Paper, Typography, Stack } from '@mui/material'
import LocationPinIcon from '@mui/icons-material/LocationPin'

export default function RouteToLocation({ match }: { match: DetailedMatchInfo }) {
  if (!match.location || !match.status.waarde || match.status.waarde.toLowerCase() === 'gespeeld') {
    return null
  }

  return (
    <Paper elevation={4}>
      <Typography variant="h4" component="h2">Locatie</Typography>
      <hr />
      <Stack direction="row" alignItems="center">
        <LocationPinIcon fontSize="medium" />
        <Typography variant="h6" component="p">
          {match.location.naam}
          ,
          {' '}
          {match.location.adres.plaats}
        </Typography>
      </Stack>
      <iframe
        className="club-map"
        loading="lazy"
        allowFullScreen
        width="100%"
        height={300}
        src={`https://maps.google.com/maps?q=${match.location.adres.breedtegraad},${match.location.adres.lengtegraad}&z=9&hl=nl&output=embed`}
      >
      </iframe>
    </Paper>
  )
}
