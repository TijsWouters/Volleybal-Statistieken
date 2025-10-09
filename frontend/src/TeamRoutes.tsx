import { Route, useParams, Routes } from 'react-router'
import { createContext } from 'react'

import TeamOverview from './team/teamOverview/TeamOverview'
import TeamStandings from './team/teamStandings/TeamStandings'
import TeamMatches from './team/teamProgram/TeamMatches'
import { useTeamData } from './query'
import Loading from './Loading'

const TeamContext = createContext(null)

export default function TeamRoutes() {
  const { clubId, teamType, teamId } = useParams<{
    clubId: string
    teamType: string
    teamId: string
  }>()

  const { data, isPending, error } = useTeamData(clubId!, teamType!, teamId!)

  if (error) throw error
  if (isPending) return <Loading />

  console.log('Rendering TeamRoutes for', clubId, teamType, teamId)

  return (
    <TeamContext.Provider value={data}>
      <Routes>
        <Route path="/" element={<TeamOverview />} />
        <Route path="/program" element={<TeamMatches future={true} />} />
        <Route path="/results" element={<TeamMatches future={false} />} />
        <Route path="/standings" element={<TeamStandings />} />
      </Routes>
    </TeamContext.Provider>
  )
}
