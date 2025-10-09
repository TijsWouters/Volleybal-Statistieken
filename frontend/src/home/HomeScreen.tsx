import { Paper } from '@mui/material'

import TeamSearch from './TeamSearch'

export default function HomeScreen() {
  return (
    <div className="home-screen-container">
      <Paper sx={{ height: '100%', width: '40rem', boxSizing: 'border-box' }}>
        <TeamSearch />
      </Paper>
    </div>
  )
}
