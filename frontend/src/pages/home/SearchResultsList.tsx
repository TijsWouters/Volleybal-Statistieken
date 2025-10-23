import { ListItemButton, ListItem, Typography } from '@mui/material'
import { List, type RowComponentProps } from 'react-window'
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
      <div className="entry">
        <div className="entry-icon-and-title" onClick={() => navigate(`/${result.type}${url}`)}>
          {result.type === 'team' && <GroupsIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
          {result.type === 'club' && <SportsVolleyballIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
          <p className="entry-title">
            {result.title}
          </p>
        </div>
        {isFavourite(url)
          ? <Favorite className="favourite-marker" onClick={() => removeFavourite(url)} />
          : <FavoriteBorder className="favourite-marker" onClick={() => addToFavourites(result.title, url, result.type)} />}
      </div>
    )
  }

  function Row({ results, index, style }: RowComponentProps<{ results: SearchResult[] }>) {
    const result = results[index]
    return (
      <ListItem divider dense key={result.title} disablePadding sx={{ backgroundColor: index % 2 === 0 ? 'var(--color-95)' : 'var(--color-90)', ...style, cursor: 'pointer' }}>
        <ListItemButton key={result.title} component={TeamLink} result={result} />
      </ListItem>
    )
  }

  return (
    <div className="search-results">
      {loading && <Loading />}
      {error && !loading && <Typography variant="h5" className="no-result">{error}</Typography>}
      {!error && !loading && (
        <List
          className="results-list"
          rowComponent={Row}
          rowCount={results.length}
          rowProps={{ results }}
          rowHeight={37}
        />
      )}
    </div>
  )
}

function getResultUrl(result: SearchResult): string {
  const parts = result.url.split('/').filter(Boolean)
  if (result.type === 'club') {
    const last = parts.slice(-1)
    return `/${last}`
  }
  else if (result.type === 'team') {
    const lastThree = parts.slice(-3).join('/')
    return `/${lastThree}`
  }
  return '/'
}
