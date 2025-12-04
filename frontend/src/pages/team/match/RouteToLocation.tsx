import { Typography } from '@mui/material'
import { useLocationData } from '@/query'

export default function RouteToLocation({ match }: { match: DetailedMatchInfo }) {
  const { data: location } = useLocationData()

  if (!match || !location) {
    return null
  }

  return (
    <>
      <Typography variant="h6" component="p" fontWeight={400} textAlign="center" className="mb-1 dark:text-white">
        {location.naam}
        ,
        {' '}
        {location.adres.plaats}
      </Typography>
      <iframe
        className="w-full h-[300px] border border-panel-border rounded-2xl bg-green-50"
        loading="lazy"
        allowFullScreen
        width="100%"
        src={`https://maps.google.com/maps?q=${location.adres.breedtegraad},${location.adres.lengtegraad}&z=9&hl=nl&output=embed`}
      >
      </iframe>
    </>
  )
}
