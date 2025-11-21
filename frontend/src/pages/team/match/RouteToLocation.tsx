import { Typography, Stack } from '@mui/material'
import LocationPinIcon from '@mui/icons-material/LocationPin'

export default function RouteToLocation({ match }: { match: DetailedMatchInfo }) {
  if (!match.location) {
    return null
  }

  return (
    <>
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
    </>
  )
}
