import { Paper, Stack, Typography } from '@mui/material'

import TeamSearch from './TeamSearch'
import { useEffect } from 'react'

export default function HomeScreen() {
  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  return (
    <Stack spacing={4} alignItems="center">
      <Typography variant="h1" gutterBottom sx={{ textAlign: 'center', letterSpacing: '0.02rem', color: 'var(--purple-20)', fontFamily: 'Varsity', fontSize: '7rem', textDecoration: 'underline' }}>
        VOLLEYBAL
        <br />
        STATISTIEKEN
      </Typography>
      <Paper sx={{ height: '100%', width: '40rem', boxSizing: 'border-box' }}>
        <TeamSearch />
      </Paper>
    </Stack>
  )
}
