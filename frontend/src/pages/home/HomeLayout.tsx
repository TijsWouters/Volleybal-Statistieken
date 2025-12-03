import { Typography, IconButton, BottomNavigationAction, Drawer, ButtonGroup, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import FavoriteIcon from '@mui/icons-material/Favorite'
import RestoreIcon from '@mui/icons-material/Restore'
import { Link, Outlet, Link as RouterLink, useLocation } from 'react-router'
import '@/styles/home.css'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareButton from '@/components/ShareButton'
import NotificationsButton from '@/components/NotificationsButton'
import AppBar from '@/components/AppBar'
import BottomNavigation from '@/components/BottomNavigation'
import CloseIcon from '@mui/icons-material/Close'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { GitHub } from '@mui/icons-material'
import { Instagram } from '@mui/icons-material'

const NAVIGATION_OPTIONS = ['teams', 'clubs', 'favourites', 'recent'] as const
const NAVIGATION_TITLES = ['Teams zoeken', 'Clubs zoeken', 'Favorieten', 'Recent bekeken'] as const

export default function HomeLayout() {
  const location = useLocation()
  const path = location.pathname.split('/')[2]
  const [bottomNavigationValue, setBottomNavigationValue] = useState<number>(NAVIGATION_OPTIONS.indexOf(path as typeof NAVIGATION_OPTIONS[number]) + 1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  useEffect(() => {
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[2] as typeof NAVIGATION_OPTIONS[number]) + 1)
  }, [location.pathname])

  return (
    <>
      <AppBar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <SportsVolleyballIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {NAVIGATION_TITLES[bottomNavigationValue - 1]}
        </Typography>
        <NotificationsButton />
        <ShareButton />
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
      </AppBar>
      <div className="overflow-y-auto flex flex-col grow w-full pt-16 max-w-[1200px] pb-8">
        <Outlet />
      </div>
      <BottomNavigation bottomNavigationValue={bottomNavigationValue}>
        <BottomNavigationAction label="Teams" icon={<GroupsIcon />} component={RouterLink} to="teams" viewTransition />
        <BottomNavigationAction label="Clubs" icon={<SportsVolleyballIcon />} component={RouterLink} to="clubs" viewTransition />
        <BottomNavigationAction label="Favorieten" icon={<FavoriteIcon />} component={RouterLink} to="favourites" viewTransition />
        <BottomNavigationAction label="Recent" icon={<RestoreIcon />} component={RouterLink} to="recent" viewTransition />
      </BottomNavigation>
      <SettingsDrawer settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />
    </>
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
          <div>
            <Instagram className="mx-auto text-center dark:text-white mr-1" />
            <Link className="dark:text-white text-center" to="https://www.instagram.com/volleybal_statistieken/" target="_blank" rel="noopener noreferrer">
              Volleybal Statistieken op Instagram
            </Link>
          </div>
          <div>
            <GitHub className="mx-auto text-center dark:text-white mr-1" />
            <Link className="dark:text-white text-center" to="https://github.com/TijsWouters/Volleybal-Statistieken" target="_blank" rel="noopener noreferrer">
              Bekijk de code op GitHub
            </Link>
          </div>

          <div className="text-center dark:text-white">
            Volleybal Statistieken maakt gebruikt van data van de
            {' '}
            <Link className="dark:text-white text-center" to="https://www.volleybal.nl" target="_blank" rel="noopener noreferrer">Nevobo</Link>
          </div>
          <div className="text-center dark:text-white">
            v2.0
          </div>
        </div>
      </div>
    </Drawer>
  )
}
