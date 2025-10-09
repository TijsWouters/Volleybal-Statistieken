import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router'

import HomeScreen from './home/HomeScreen'
import './styles/app.css'
import TeamRoutes from './TeamRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/team/:clubId/:teamType/:teamId/*" element={<TeamRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}
