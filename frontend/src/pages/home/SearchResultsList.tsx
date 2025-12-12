import { ListItemButton, ListItem, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { FavoriteRounded, FavoriteBorderRounded } from '@mui/icons-material'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import type { SearchResult } from './Search'

import Loading from '@/components/Loading'
import { useFavourites } from '@/hooks/useFavourites'
import type { JSX } from 'react'

export default function SearchResultsList({ results, error, loading, placeHolder }: { results: SearchResult[] | null, error: string | null, loading: boolean, placeHolder: JSX.Element }) {
  const navigate = useNavigate()
  const { removeFavourite, isFavourite, addToFavourites } = useFavourites()

  function TeamLink({ result }: { result: SearchResult }) {
    const url = getResultUrl(result)
    return (
      <div className="flex justify-between items-center w-full px-4 py-2">
        <div className="flex flex-row grow items-center" onClick={() => navigate(`/${result.type}${url}/overview`, { viewTransition: true })}>
          {result.type === 'team' && <GroupsIcon className="align-middle mr-2" />}
          {result.type === 'club' && <SportsVolleyballIcon className="align-middle mr-2" />}
          <Typography className="inline align-middle m-0">
            {result.title}
          </Typography>
        </div>
        {isFavourite(url)
          ? <FavoriteRounded className="favourite-marker text-accent" onClick={() => removeFavourite(url)} />
          : <FavoriteBorderRounded className="favourite-marker" onClick={() => addToFavourites(result.title, url, result.type)} />}
      </div>
    )
  }

  function Row({ result, index }: { result: SearchResult, index: number }) {
    const bgClass = index % 2 === 0 ? 'bg-panel' : 'bg-background'
    return (
      <ListItem divider dense key={result.title} disablePadding className={`${bgClass} cursor-pointer h-auto select-none last:border-b-panel-border first:border-t-panel-border`}>
        <ListItemButton key={result.title} component={TeamLink} result={result} />
      </ListItem>
    )
  }

  return (
    <div className="flex flex-col grow">
      {loading && <Loading />}
      {results && !error && !loading && (
        results.map((result, index) => (
          <Row key={result.title} result={result} index={index} />
        ))
      )}
      {results && results.length === 0 && (
        <div className="flex flex-col grow w-full justify-center items-center text-black opacity-80 dark:text-white">
          <div className="relative">
            <EventBusyIcon className="text-[60vmin]" />
          </div>
          <Typography textAlign="center" variant="h6" className="px-4 text-center">
            Geen resultaten gevonden
          </Typography>
        </div>
      )}
      {!results && !loading && !error && (
        placeHolder
      )}
    </div>
  )
}

function getResultUrl(result: SearchResult): string {
  const parts = result.url.split('/').filter(Boolean)
  if (result.type === 'club') {
    const clubId = parts[parts.length - 1]
    return `/${clubId}`
  }
  else if (result.type === 'team') {
    const teamUrl = parts.slice(-3).join('/')
    return `/${teamUrl}`
  }
  return '/'
}
