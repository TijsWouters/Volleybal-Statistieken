import { Routes, Route } from 'react-router'

import TeamSelection from './TeamSelection'
import Team from './Team'

import { BrowserRouter } from 'react-router'

import './styles/app.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeamSelection />} />
        <Route path="/team/:clubId/:teamType/:teamId" element={<Team />} />
      </Routes>
    </BrowserRouter>
  )
}
