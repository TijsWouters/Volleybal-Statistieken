import { Routes, Route } from 'react-router'

import HomeScreen from './home/HomeScreen'

import TeamOverview from './team/teamOverview/TeamOverview'
import TeamProgram from './team/teamProgram/TeamMatches'

import { BrowserRouter } from 'react-router'

import './styles/app.css'
import { createContext } from 'react'
import TeamMatches from './team/teamProgram/TeamMatches'

const TeamDataContext = createContext({})

export default function App() {
  return (
    <TeamDataContext.Provider value={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/team/:clubId/:teamType/:teamId" element={<TeamOverview />} />
          <Route path="/team/:clubId/:teamType/:teamId/program" element={<TeamMatches future={true} />} />
          <Route path="/team/:clubId/:teamType/:teamId/results" element={<TeamMatches future={false} />} />
        </Routes>
      </BrowserRouter>
    </TeamDataContext.Provider>
  )
}
