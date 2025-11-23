import { useLocation, Outlet } from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography, Paper, Snackbar, Alert, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { useEffect, createContext, useState } from 'react'
import Link from '@mui/material/Link'
import dayjs from 'dayjs'

import 'dayjs/locale/nl'
// Set the locale globally
dayjs.locale('nl')

// Load font weights you actually use
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import '@/styles/app.css'
import '@/styles/components.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type SnackbarContextType = {
  openSnackbar: boolean
  setOpenSnackbar: (open: boolean) => void
  setSnackbarText: (text: string) => void
  setSnackbarSeverity: (severity: 'error' | 'warning' | 'info' | 'success') => void
}

export const SnackbarContext = createContext<SnackbarContextType>(null as any)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
})

const theme = createTheme({
  // tweak as you like
  palette: {
    mode: 'light',
    primary: { main: '#00ADB5' },
  },
})

export default function App() {
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
  const [snackbarText, setSnackbarText] = useState<string>('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('info')

  useEffect(() => {
  }, [openSnackbar])

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ErrorBoundary fallbackRender={FallbackRender}>
              <SnackbarContext.Provider value={{
                openSnackbar,
                setOpenSnackbar,
                setSnackbarText,
                setSnackbarSeverity,
              }}
              >
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
                <Outlet />
              </SnackbarContext.Provider>
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
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
