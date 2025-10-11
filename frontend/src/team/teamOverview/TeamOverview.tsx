import { Paper } from '@mui/material'

import TeamInfo from './TeamInfo'
import TeamOverviewProgram from './TeamOverviewProgram'
import TeamOverviewResults from './TeamOverviewResults'
import TeamOverviewStandings from './TeamOverviewStandings'
import { useContext, useEffect } from 'react'
import { TeamContext } from '../TeamRoutes'

import '../../styles/team-overview.css'

export default function TeamOverview() {
  const data = useContext(TeamContext)

  useEffect(() => {
    document.title = data.fullTeamName
  }, [data.fullTeamName])

  return (
    <div className="team-overview-container fade-in">
      <Paper className="team-info">
        <TeamInfo />
      </Paper>
      <div className="team-overview-content">
        <Paper className="paper">
          <TeamOverviewProgram />
        </Paper>
        <Paper className="paper">
          <TeamOverviewResults />
        </Paper>
        <Paper className="paper">
          <TeamOverviewStandings />
        </Paper>
      </div>
    </div>
  )
}
