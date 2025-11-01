import { Route, useParams, Routes } from 'react-router'
import { createContext } from 'react'

import TeamOverview from './teamOverview/TeamOverview'
import TeamStandings from './teamStandings/TeamStandings'
import TeamMatches from './teamMatches/TeamMatches'
import MatchPage from './match/MatchPage'

import { useTeamData } from '@/query'
import Loading from '@/components/Loading'
import type { Data } from '@/query'
import PoulePage from './poule/PoulePage'

const TeamContext = createContext<Data>({} as Data)
export { TeamContext }

export default function TeamRoutes() {
  const { clubId, teamType, teamId } = useParams<{
    clubId: string
    teamType: string
    teamId: string
  }>()

  const { data, isPending, error } = useTeamData(clubId!, teamType!, teamId!)

  if (error) throw error
  if (isPending) {
    // eslint-disable-next-line react-hooks/immutability
    document.title = 'Laden...'
    return <Loading />
  }

  return (
    <TeamContext.Provider value={data}>
      <Routes>
        <Route path="/" element={<TeamOverview />} />
        <Route path="/program" element={<TeamMatches future={true} />} />
        <Route path="/results" element={<TeamMatches future={false} />} />
        <Route path="/standings" element={<TeamStandings />} />
        <Route path="/match/:matchUuid" element={<MatchPage />} />
        <Route path="/poule" element={<PoulePage />} />
      </Routes>
    </TeamContext.Provider>
  )
}
