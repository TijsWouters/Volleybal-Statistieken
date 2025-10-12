import { ListItemButton, ListItemText, ListItem, Typography } from '@mui/material'
import { List, type RowComponentProps } from 'react-window'
import type { TeamSearchResult } from './home/TeamSearch'
import Loading from './Loading'

export default function SearchResultsList({ teams, searchTerm, loading }: { teams: TeamSearchResult[], searchTerm: string, loading: boolean }) {
  if (loading) {
    return <Loading />
  }

  if (searchTerm.length === 0) { 
    return <Typography variant="h5">Vul een zoekterm in om naar teams te zoeken</Typography>
  }

  if (searchTerm.length < 3) {
    return <Typography variant="h5">Vul minimaal drie karakters in om te zoeken</Typography>
  }

  if (teams.length === 0) { 
    return <Typography variant="h5">Geen teams gevonden</Typography>
  }


  function Row({ teams, index, style }: RowComponentProps<{ teams: TeamSearchResult[] }>) {
    const team = teams[index]
    return (
      <ListItem divider dense key={team.id} disablePadding sx={{ backgroundColor: index % 2 === 0 ? 'var(--purple-95)' : 'var(--purple-90)', ...style }}>
        <ListItemButton key={team.id} component="a" href={mapNevoboUrl(team.url)}>
          <ListItemText primary={team.name} />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <List 
      className="results-list" 
      rowComponent={Row}
      rowCount={teams.length}
      rowProps={{ teams }}
      rowHeight={37}
      />
  )
}

function mapNevoboUrl(nevoboUrl: string) {
  const parts = nevoboUrl.split('/').filter(Boolean)
  const lastThree = parts.slice(-3).join('/')
  return `/team/${lastThree}`
}
