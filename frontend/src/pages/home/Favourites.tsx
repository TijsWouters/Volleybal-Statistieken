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
    <div className="favourites-container">
      <SearchResultsList results={favouritesWithUrls} error={error} loading={false} />
    </div>

  )
}
