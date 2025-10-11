import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography, Paper } from '@mui/material'

import HomeScreen from './home/HomeScreen'
import './styles/app.css'
import TeamRoutes from './team/TeamRoutes'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ErrorBoundary fallbackRender={fallbackRender}>
          <BrowserRouter>
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
