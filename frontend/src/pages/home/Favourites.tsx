import { Typography } from '@mui/material'
import SearchResultsList from './SearchResultsList'
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded'
import { useFavourites } from '@/hooks/useFavourites'

export default function Favourites() {
  const { favourites } = useFavourites()

  const favouritesWithUrls = favourites.map(entry => ({
    title: entry.title,
    url: `/${entry.type}/${entry.url}`,
    type: entry.type,
  }))

  return (
    <div className="flex flex-col w-full grow">
      <Typography textAlign="center" fontWeight={300} className="p-4">
        Voeg teams of clubs toe aan je favorieten met het hartje op de team- of clubpagina
      </Typography>
      <SearchResultsList results={favouritesWithUrls.length > 0 ? favouritesWithUrls : null} error={null} loading={false} placeHolder={<PlaceHolder />} />
    </div>
  )
}

function PlaceHolder() {
  return (
    <div className="flex flex-col grow w-full justify-center items-center text-black opacity-80 dark:text-white">
      <div className="relative">
        <HeartBrokenRoundedIcon className="text-[55vmin]" />
      </div>
      <Typography textAlign="center" variant="h6" className="px-4 text-center">
        Je hebt nog geen favorieten toegevoegd
      </Typography>
    </div>
  )
}
