import { ListItemButton, ListItem } from '@mui/material'
import { useNavigate } from 'react-router'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { Favorite, FavoriteBorder } from '@mui/icons-material'

import type { SearchResult } from './Search'

import Loading from '@/components/Loading'
import { useFavourites } from '@/hooks/useFavourites'

export default function SearchResultsList({ results, error, loading }: { results: SearchResult[], error: string | null, loading: boolean }) {
  const navigate = useNavigate()
  const { removeFavourite, isFavourite, addToFavourites } = useFavourites()

  function TeamLink({ result }: { result: SearchResult }) {
    const url = getResultUrl(result)
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignItems: 'center' }} onClick={() => navigate(`/${result.type}${url}/overview`)}>
          {result.type === 'team' && <GroupsIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
          {result.type === 'club' && <SportsVolleyballIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
          <p style={{ display: 'inline', verticalAlign: 'middle', margin: 0 }}>
            {result.title}
          </p>
        </div>
        {isFavourite(url)
          ? <Favorite className="favourite-marker" style={{ color: 'var(--color-accent)' }} onClick={() => removeFavourite(url)} />
          : <FavoriteBorder className="favourite-marker" onClick={() => addToFavourites(result.title, url, result.type)} />}
      </div>
    )
  }

  function Row({ result, index }: { result: SearchResult, index: number }) {
    const color = index % 2 === 0 ? 'white' : 'var(--color-background)'
    return (
      <ListItem divider dense key={result.title} disablePadding sx={{ backgroundColor: color, cursor: 'pointer', height: 'auto', userSelect: 'none' }}>
        <ListItemButton key={result.title} component={TeamLink} result={result} />
      </ListItem>
    )
  }

  return (
    <div style={{ flexGrow: 1 }}>
      {loading && <Loading />}
      {!error && !loading && (
        results.map((result, index) => (
          <Row key={result.title} result={result} index={index} />
        ))
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
