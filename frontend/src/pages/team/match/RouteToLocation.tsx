import { Typography } from '@mui/material'
import { useLocationData } from '@/query'

export default function RouteToLocation({ match }: { match: DetailedMatchInfo }) {
  const { data: location } = useLocationData()

  if (!match || !location) {
    return null
  }

  return (
    <>
      <Typography variant="h6" component="p" fontWeight={300} textAlign="center">
        {location.naam}
        ,
        {' '}
        {location.adres.plaats}
      </Typography>
      <iframe
        className="club-map"
        loading="lazy"
        allowFullScreen
        width="100%"
        height={300}
        src={`https://maps.google.com/maps?q=${location.adres.breedtegraad},${location.adres.lengtegraad}&z=9&hl=nl&output=embed`}
      >
      </iframe>
    </>
  )
}
