import { Paper, Typography, Button } from '@mui/material'

import TeamSearch from './TeamSearch'
import { useEffect } from 'react'

import '../styles/home.css'

declare global {
  interface Window {
    deferredPWAInstallPrompt: any
    canInstallPWA: () => boolean
  }
}

export default function HomeScreen() {
  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  console.log(window.deferredPWAInstallPrompt)
  console.log(window.canInstallPWA)
  return (
    <div className='home-screen-container'>
      <Typography className='title' variant="h1">
        VOLLEYBAL
        <br />
        STATISTIEKEN
      </Typography>
      <Button
        style={{ display: window.canInstallPWA() ? 'block' : 'none' }}
        variant="contained"
        size="small"
        onClick={() => window.deferredPWAInstallPrompt().prompt()}
      >
        Download Volleybal Statistieken als app
      </Button>
      <Paper className="search">
        <TeamSearch />
      </Paper>
    </div>
  )
}
