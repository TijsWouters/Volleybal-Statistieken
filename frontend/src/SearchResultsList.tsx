import { ListItemButton, ListItem, Typography } from '@mui/material'
import { List, type RowComponentProps } from 'react-window'
import type { TeamSearchResult } from './home/TeamSearch'
import Loading from './Loading'
import { useNavigate } from 'react-router'

export default function SearchResultsList({ teams, searchTerm, loading }: { teams: TeamSearchResult[], searchTerm: string, loading: boolean }) {
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

  if (teams.length === 0) { 
    return <Typography variant="h5" className='no-result'>Geen teams gevonden</Typography>
  }

  function TeamLink({ to, teamName }: { to: string, teamName: string }) {
    return (
      <p onClick={(e) => { e.preventDefault(); navigate(to) }}>
        {teamName}
      </p>
    )
  }

  function Row({ teams, index, style }: RowComponentProps<{ teams: TeamSearchResult[] }>) {
    const team = teams[index]
    return (
      <ListItem divider dense key={team.id} disablePadding sx={{ backgroundColor: index % 2 === 0 ? 'var(--purple-95)' : 'var(--purple-90)', ...style, cursor: 'pointer' }}>
        <ListItemButton key={team.id} component={TeamLink} to={mapNevoboUrl(team.url)} teamName={team.name} />
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
