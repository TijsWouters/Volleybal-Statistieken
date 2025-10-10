import { Paper } from '@mui/material'

import TeamSearch from './TeamSearch'
import { useEffect } from 'react'

export default function HomeScreen() {
  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  return (
    <div className="home-screen-container">
      <Paper sx={{ height: '100%', width: '40rem', boxSizing: 'border-box' }}>
        <TeamSearch />
      </Paper>
    </div>
  )
}
