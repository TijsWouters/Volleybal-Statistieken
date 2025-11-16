import { Routes, Route, useLocation } from 'react-router'
import { BrowserRouter } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography, Paper, Snackbar, Alert } from '@mui/material'
import { useEffect, createContext, useState } from 'react'
import Link from '@mui/material/Link'

import Notifications from '@/components/Notifications'
import HomeScreen from '@/pages/home/HomeScreen'
import Club from '@/pages/club/Club'
import '@/styles/app.css'
import '@/styles/components.css'
import TeamRoutes from '@/pages/team/TeamRoutes'
import Footer from '@/components/Footer'

type SnackbarContextType = {
  openSnackbar: boolean
  setOpenSnackbar: (open: boolean) => void
  setSnackbarText: (text: string) => void
  setSnackbarSeverity: (severity: 'error' | 'warning' | 'info' | 'success') => void
}

export const SnackbarContext = createContext<SnackbarContextType>(null as any)

export default function App() {
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
  const [snackbarText, setSnackbarText] = useState<string>('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('info')

  useEffect(() => {
  }, [openSnackbar])

  return (
    <>
      <div className="app-container">
        <ErrorBoundary fallbackRender={FallbackRender}>
          <SnackbarContext.Provider value={{
            openSnackbar,
            setOpenSnackbar,
            setSnackbarText,
            setSnackbarSeverity,
          }}
          >
            <BrowserRouter>
              <Snackbar
                className="snackbar"
                open={openSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={() => setOpenSnackbar(false)}
              >
                <Alert
                  onClose={() => setOpenSnackbar(false)}
                  severity={snackbarSeverity}
                  variant="filled"
                >
                  {snackbarText}
                </Alert>
              </Snackbar>
              <ScrollReset />
              <Notifications />
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/team/:clubId/:teamType/:teamId/*" element={<TeamRoutes />} />
                <Route path="/club/:clubId" element={<Club />} />
              </Routes>
            </BrowserRouter>
          </SnackbarContext.Provider>
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
    const sel = window.getSelection?.()
    if (sel?.removeAllRanges) sel.removeAllRanges()
  }, [location.pathname])

  return null
}

function FallbackRender({ error }: { error: Error }) {
  return (
    <Paper elevation={4} style={{ backgroundColor: '#ff6a6aff', padding: '1rem', maxWidth: '100%' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Helaas, er is iets misgegaan
      </Typography>
      <Typography variant="h5" gutterBottom>
        {error.message}
      </Typography>
      <Link href="/">Ga terug naar de startpagina</Link>
    </Paper>
  )
}
