import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography, Paper, Snackbar, Alert, CssBaseline, ThemeProvider, createTheme, Drawer, IconButton, Button, ButtonGroup } from '@mui/material'
import { useEffect, createContext, useState } from 'react'
import Link from '@mui/material/Link'
import dayjs from 'dayjs'
import { router } from './routes'
import CloseIcon from '@mui/icons-material/Close'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

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
import { GitHub, Instagram } from '@mui/icons-material'

type SnackbarContextType = {
  openSnackbar: boolean
  setOpenSnackbar: (open: boolean) => void
  setSnackbarText: (text: string) => void
  setSnackbarSeverity: (severity: 'error' | 'warning' | 'info' | 'success') => void
}

type SettingsContextType = {
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

export const SnackbarContext = createContext<SnackbarContextType>(null as any)
export const SettingsContext = createContext<SettingsContextType>(null as any)

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

export default function Root() {
  return <RouterProvider router={router} />
}

export function App() {
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
  const [snackbarText, setSnackbarText] = useState<string>('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('info')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
  }, [openSnackbar])

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <ErrorBoundary fallbackRender={FallbackRender}>
          <SettingsContext.Provider value={{ settingsOpen, setSettingsOpen }}>
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
              <SelectionReset />
              <Outlet />
              <SettingsDrawer settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />
            </SnackbarContext.Provider>
          </SettingsContext.Provider>
        </ErrorBoundary>
        <ScrollRestoration
          getKey={location => location.pathname.includes('poule') ? location.pathname + location.search : location.pathname}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function SelectionReset() {
  const location = useLocation()

  useEffect(() => {
    const sel = window.getSelection?.()
    if (sel?.removeAllRanges) sel.removeAllRanges()
  }, [location.pathname])

  return null
}

function FallbackRender() {
  return (
    <div className="flex flex-col items-center justify-center p-4 grow max-w-full">
      <Paper elevation={4} className="bg-[#ff8585] p-4 max-w-full">
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Helaas, er is iets misgegaan :(
        </Typography>
        <Typography variant="h5" gutterBottom className="text-wrap break-all">
          {window.location.href}
        </Typography>
        <Typography variant="body1" gutterBottom className="mb-4">
          Wil je helpen Volleybal Statistieken te verbeteren? Stuur een screenshot van deze foutmelding naar
          {' '}
          <Link href="https://instagram.com/volleybal_statistieken">@volleybal_statistieken</Link>
          {' '}
          op Instagram.
        </Typography>
        <Link href="/ ">Ga terug naar de startpagina</Link>
      </Paper>
    </div>
  )
}

const LIGHTNESS_LEVELS = {
  dark: [45, 70, 30],
  light: [35, 60, 20],
}
const COLOR_HUES = [183, 50, 230, 280, 330]
const COLOR_OPTIONS = COLOR_HUES.map(hue => ({
  hue,
  lightnessLevels: LIGHTNESS_LEVELS,
}))

function SettingsDrawer({ settingsOpen, setSettingsOpen }: { settingsOpen: boolean, setSettingsOpen: (open: boolean) => void }) {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(localStorage.theme === 'light' ? 'light' : localStorage.theme === 'dark' ? 'dark' : 'system')
  const [accentHue, setAccentHue] = useState<number>(parseInt(localStorage.accentHue) || 183)

  const handleColorChange = (hue: number) => {
    const effectiveMode: 'light' | 'dark' = mode === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode
    document.documentElement.style.setProperty('--color-accent', `hsl(${hue}, 100%, ${LIGHTNESS_LEVELS[effectiveMode][0]}%)`)
    document.documentElement.style.setProperty('--color-accent-light', `hsl(${hue}, 100%, ${LIGHTNESS_LEVELS[effectiveMode][1]}%)`)
    document.documentElement.style.setProperty('--color-accent-light-opacity', `hsla(${hue}, 100%, ${LIGHTNESS_LEVELS[effectiveMode][1]}%, 0.6)`)
    document.documentElement.style.setProperty('--color-accent-dark', `hsl(${hue}, 100%, ${LIGHTNESS_LEVELS[effectiveMode][2]}%)`)
    document.documentElement.style.setProperty('--color-accent-dark-opacity', `hsla(${hue}, 100%, ${LIGHTNESS_LEVELS[effectiveMode][2]}%, 0.6)`)
    localStorage.accentHue = hue.toString()
    setAccentHue(hue)
  }

  useEffect(() => {
    if (mode === 'light') {
      localStorage.theme = 'light'
    }
    else if (mode === 'dark') {
      localStorage.theme = 'dark'
    }
    else {
      delete localStorage.theme
    }
    document.documentElement.classList.toggle(
      'dark',
      localStorage.theme === 'dark'
      || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches),
    )
    handleColorChange(parseInt(localStorage.accentHue) || 183)
  }, [mode])

  return (
    <Drawer className="rounded-4xl" anchor="right" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
      <div className="w-full h-full bg-white dark:bg-secondary flex flex-col items-center">
        <div className="border-b border-panel-border w-full px-6 pt-4 pb-2 flex flex-row justify-between items-center">
          <Typography variant="h4" className="dark:text-white">Instellingen</Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={() => setSettingsOpen(false)}
          >
            <CloseIcon className="dark:text-white" />
          </IconButton>
        </div>
        <div className="p-4 w-full">
          <Typography variant="h6" className="dark:text-white">Modus</Typography>
          <ButtonGroup
            fullWidth
            className="mt-2 select-metric-button-group flex-col md:flex-row"
            orientation={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          >
            <Button
              startIcon={<LightModeIcon />}
              variant={mode === 'light' ? 'contained' : 'outlined'}
              onClick={() => setMode('light')}
            >
              Licht
            </Button>
            <Button
              startIcon={<DarkModeIcon />}
              variant={mode === 'dark' ? 'contained' : 'outlined'}
              onClick={() => setMode('dark')}
            >
              Donker
            </Button>
            <Button
              startIcon={<SettingsBrightnessIcon />}
              variant={mode === 'system' ? 'contained' : 'outlined'}
              onClick={() => setMode('system')}
            >
              Systeem
            </Button>
          </ButtonGroup>
        </div>
        <div className="p-4 w-full border-t border-panel-border">
          <Typography variant="h6" className="dark:text-white">Kleur</Typography>
          <div className="mt-2 flex flex-row gap-4 justify-start flex-wrap">
            {COLOR_OPTIONS.map(colorOption => (
              <button
                key={colorOption.hue}
                className={`w-10 h-10 rounded-full transition-all ${accentHue === colorOption.hue ? 'dark:border-white border-2' : ''}`}
                style={{ backgroundColor: `hsl(${colorOption.hue}, 100%, 50%)` }}
                onClick={() => { handleColorChange(colorOption.hue) }}
              />
            ))}
          </div>
        </div>
        <div className="bg-transparent mt-auto w-full flex flex-col p-4 border-t border-panel-border items-center gap-1">
          <Typography variant="body1" className="dark:text-white text-center">
            Gemaakt door Tijs
          </Typography>
          <div className="text-center">
            <Instagram className="mx-auto text-center dark:text-white mr-1" />
            <Link className="dark:text-white text-center" href="https://www.instagram.com/volleybal_statistieken/" target="_blank" rel="noopener noreferrer">
              Volleybal Statistieken op Instagram
            </Link>
          </div>
          <div>
            <GitHub className="mx-auto text-center dark:text-white mr-1" />
            <Link className="dark:text-white text-center" href="https://github.com/TijsWouters/Volleybal-Statistieken" target="_blank" rel="noopener noreferrer">
              Bekijk de code op GitHub
            </Link>
          </div>

          <div className="text-center dark:text-white">
            Volleybal Statistieken maakt gebruikt van data van de
            {' '}
            <Link className="dark:text-white text-center" href="https://www.volleybal.nl" target="_blank" rel="noopener noreferrer">Nevobo</Link>
          </div>
          <div className="text-center dark:text-white">
            v2.0
          </div>
        </div>
      </div>
    </Drawer>
  )
}
