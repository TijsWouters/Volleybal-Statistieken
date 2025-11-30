import Search from './Search'
import SearchIcon from '@mui/icons-material/Search'
import SportsVolleyball from '@mui/icons-material/SportsVolleyball'
import { Typography } from '@mui/material'

export default function ClubSearch() {
  return <Search type="club" placeHolder={<PlaceHolder />} />
}

function PlaceHolder() {
  return (
    <div style={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
      <div style={{ position: 'relative' }}>
        <SportsVolleyball style={{ position: 'absolute', left: '16vmin', top: '16vmin', fontSize: '16vmin' }} />
        <SearchIcon style={{ fontSize: '60vmin' }} />
      </div>
      <Typography textAlign="center" variant="h6" style={{ padding: '0 1rem' }}>
        Vul minimaal drie karakters in om naar clubs te zoeken
      </Typography>
    </div>
  )
}
