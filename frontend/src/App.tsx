import { Routes, Route, useLocation } from 'react-router'
import { BrowserRouter } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography, Paper } from '@mui/material'

import HomeScreen from './home/HomeScreen'
import './styles/app.css'
import './styles/components.css'
import TeamRoutes from './team/TeamRoutes'
import Footer from './components/Footer'
import { useEffect } from 'react'

export default function App() {
  return (
    <>
      <div className="app-container">
        <ErrorBoundary fallbackRender={fallbackRender}>
          <BrowserRouter>
            <ScrollReset />
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/team/:clubId/:teamType/:teamId/*" element={<TeamRoutes />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </div>
      <Footer />
    </>
  )
}

function ScrollReset() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}

function fallbackRender({ error }: { error: Error }) {
  document.title = 'Er is iets misgegaan'

  return (
    <Paper style={{ backgroundColor: '#ff6a6aff', padding: '1rem' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Helaas, er is iets misgegaan
      </Typography>
      <Typography variant="h5" gutterBottom>
        {error.message}
      </Typography>
    </Paper>
  )
}
