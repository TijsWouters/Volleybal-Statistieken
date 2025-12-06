import { Typography } from '@mui/material'
import { useRouteData } from '@/query'

export default function RouteToLocation({ match }: { match: DetailedMatchInfo }) {
  const { data } = useRouteData()

  if (!match || !data) {
    return null
  }

  return (
    <>
      <Typography variant="h6" component="p" fontWeight={400} textAlign="center" className="mb-1 dark:text-white">
        {data.locationData.naam}
        ,
        {' '}
        {data.locationData.adres.plaats}
      </Typography>
      <iframe
        className="w-full h-[300px] border border-panel-border rounded-2xl bg-green-50"
        loading="lazy"
        allowFullScreen
        width="100%"
        src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyC3_d8UM4kSe9Qui8C0l2FZ_zc2wGZNNVU&origin=${encodeURIComponent(data.clubInfo.naam + ', ' + data.clubInfo.vestigingsplaats + ' volleybal')}&destination=${encodeURIComponent(data.locationData.naam + ', ' + data.locationData.adres.plaats)}&mode=driving&zoom=9`}
      >
      </iframe>
    </>
  )
}
