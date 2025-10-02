import { Routes, Route } from 'react-router'

import HomeScreen from './home/HomeScreen'

import TeamOverview from './team/teamOverview/TeamOverview'
import TeamProgram from './team/teamProgram/TeamProgram'

import { BrowserRouter } from 'react-router'

import './styles/app.css'
import { createContext } from 'react'

const TeamDataContext = createContext({})

export default function App() {
  return (
    <TeamDataContext.Provider value={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/team/:clubId/:teamType/:teamId" element={<TeamOverview />} />
          <Route path="/team/:clubId/:teamType/:teamId/program" element={<TeamProgram />} />
        </Routes>
      </BrowserRouter>
    </TeamDataContext.Provider>
  )
}
