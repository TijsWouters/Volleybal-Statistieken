import { Typography } from '@mui/material'
import SearchResultsList from './SearchResultsList'

import { useFavourites } from '@/hooks/useFavourites'

export default function Recent() {
  const { favourites } = useFavourites()

  const error = favourites.length === 0 ? 'Je hebt nog geen teams of clubs toegevoegd aan je favorieten' : null

  const favouritesWithUrls = favourites.map(entry => ({
    title: entry.title,
    url: `/${entry.type}/${entry.url}`,
    type: entry.type,
  }))

  return (
    <div>
      <Typography textAlign="center" fontWeight={300} className="p-[16px]">
        Voeg teams of clubs toe aan je favorieten met het hartje op de team- of clubpagina
      </Typography>
      <SearchResultsList results={favouritesWithUrls} error={error} loading={false} />
    </div>
  )
}
