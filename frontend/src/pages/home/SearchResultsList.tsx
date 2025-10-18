import { ListItemButton, ListItem, Typography } from '@mui/material'
import { List, type RowComponentProps } from 'react-window'
import type { SearchResult } from './TeamSearch'
import Loading from '@/components/Loading'
import { useNavigate } from 'react-router'

export default function SearchResultsList({ results, searchTerm, loading }: { results: SearchResult[], searchTerm: string, loading: boolean }) {
  const navigate = useNavigate()

  if (loading) {
    return <Loading />
  }

  if (searchTerm.length === 0) { 
    return <Typography variant="h5" className='no-result'>Vul een zoekterm in om naar teams te zoeken</Typography>
  }

  if (searchTerm.length < 3) {
    return <Typography variant="h5" className='no-result'>Vul minimaal drie karakters in om te zoeken</Typography>
  }

  if (results.length === 0) { 
    return <Typography variant="h5" className='no-result'>Geen teams gevonden</Typography>
  }

  function TeamLink({ to, name }: { to: string, name: string }) {
    return (
      <p className="team-link" onClick={(e) => { e.preventDefault(); navigate(to) }}>
        {name}
      </p>
    )
  }

  function Row({ results, index, style }: RowComponentProps<{ results: SearchResult[] }>) {
    const result = results[index]
    return (
      <ListItem divider dense key={result.id} disablePadding sx={{ backgroundColor: index % 2 === 0 ? 'var(--purple-95)' : 'var(--purple-90)', ...style, cursor: 'pointer' }}>
        <ListItemButton key={result.id} component={TeamLink} to={getResultUrl(result)} name={result.title} />
      </ListItem>
    )
  }

  return (
    <List 
      className="results-list" 
      rowComponent={Row}
      rowCount={results.length}
      rowProps={{ results }}
      rowHeight={37}
      />
  )
}

function getResultUrl(result: SearchResult): string {
  const parts = result.url.split('/').filter(Boolean)
  if (result.type === 'club') {
    const last = parts.slice(-1)
    return `/club/${last}`
  } else if (result.type === 'team') {
    const lastThree = parts.slice(-3).join('/')
    return `/team/${lastThree}`
  }
  return '/'
}
