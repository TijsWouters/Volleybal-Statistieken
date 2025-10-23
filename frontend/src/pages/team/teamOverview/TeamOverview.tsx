import { Paper } from '@mui/material'
import { useContext, useEffect } from 'react'

import { TeamContext } from '../TeamRoutes'

import TeamInfo from './TeamInfo'
import TeamOverviewProgram from './TeamOverviewProgram'
import TeamOverviewResults from './TeamOverviewResults'
import TeamOverviewStandings from './TeamOverviewStandings'

import '@/styles/team-overview.css'

export default function TeamOverview() {
  const data = useContext(TeamContext)

  useEffect(() => {
    document.title = data.fullTeamName
  }, [data.fullTeamName])

  return (
    <div className="team-overview-container fade-in">
      <Paper elevation={4} className="team-info">
        <TeamInfo />
      </Paper>
      <div className="team-overview-content">
        <Paper elevation={4} className="paper">
          <TeamOverviewProgram />
        </Paper>
        <Paper elevation={4} className="paper">
          <TeamOverviewResults />
        </Paper>
        <Paper elevation={4} className="paper">
          <TeamOverviewStandings />
        </Paper>
      </div>
    </div>
  )
}
