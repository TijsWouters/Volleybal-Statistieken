import { Paper, Typography } from '@mui/material'

import TeamSearch from './TeamSearch'
import { useEffect } from 'react'

import '../styles/home.css'

export default function HomeScreen() {
  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  return (
    <div className='home-screen-container'>
      <Typography className='title' variant="h1">
        VOLLEYBAL
        <br />
        STATISTIEKEN
      </Typography>
      <Paper className="search">
        <TeamSearch />
      </Paper>
    </div>
  )
}
