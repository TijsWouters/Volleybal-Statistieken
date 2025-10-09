import { Grid, Stack, Paper } from '@mui/material'

import TeamInfo from './TeamInfo'
import TeamOverviewProgram from './TeamOverviewProgram'
import TeamOverviewResults from './TeamOverviewResults'
import TeamOverviewStandings from './TeamOverviewStandings'

export default function TeamOverview() {
  return (
    <div className="team-overview-container fade-in">
      <Grid container sx={{ height: 'fit-content' }} spacing={2} justifyContent="center">
        <Grid size="auto" sx={{ maxWidth: '100%' }}>
          <Paper sx={{ height: '100%', padding: '1rem' }}>
            <TeamInfo />
          </Paper>
        </Grid>
        <Grid size="auto" sx={{ maxWidth: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Paper sx={{ flex: 1, padding: '1rem' }}>
              <TeamOverviewProgram />
            </Paper>
            <Paper sx={{ flex: 1, padding: '1rem' }}>
              <TeamOverviewResults />
            </Paper>
            <Paper sx={{ flex: 1, padding: '1rem' }}>
              <TeamOverviewStandings />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </div>
  )
}
