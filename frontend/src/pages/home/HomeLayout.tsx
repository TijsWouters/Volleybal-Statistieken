import { Paper, Typography, AppBar, Toolbar, IconButton, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useEffect, useState } from 'react'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import FavoriteIcon from '@mui/icons-material/Favorite'
import RestoreIcon from '@mui/icons-material/Restore'
import { Outlet, Link as RouterLink, useLocation } from 'react-router'
import '@/styles/home.css'
import { InfoOutline } from '@mui/icons-material'
import ShareButton from '@/components/ShareButton'
import NotificationsButton from '@/components/NotificationsButton'

const NAVIGATION_OPTIONS = ['teams', 'clubs', 'favourites', 'recent'] as const
const NAVIGATION_TITLES = ['Teams zoeken', 'Clubs zoeken', 'Favorieten', 'Recent bekeken'] as const

export default function HomeLayout() {
  const location = useLocation()
  const path = location.pathname.split('/')[2]
  const [bottomNavigationValue, setBottomNavigationValue] = useState<number>(NAVIGATION_OPTIONS.indexOf(path as typeof NAVIGATION_OPTIONS[number]) + 1)

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[2] as typeof NAVIGATION_OPTIONS[number]) + 1)
    console.log(location.pathname)
  }, [location.pathname])

  const bottomNavigationHighlightStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'var(--color-accent)',
    width: '25%',
    height: '100%',
    borderRadius: '2rem',
    transition: 'transform 0.3s ease',
    transform: `translateX(${(bottomNavigationValue - 1) * 100}%) scale(1)`,
    zIndex: 0,
  }

  return (
    <>
      <AppBar position="absolute" style={{ backgroundColor: 'var(--color-primary)', color: 'white', height: '4rem' }}>
        <Toolbar>
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
          >
            <InfoOutline />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', paddingBottom: '6rem', paddingTop: '4rem' }}>
        <Outlet />
      </div>
      <Paper elevation={3} style={{ position: 'fixed', bottom: 4, marginLeft: 'auto', marginRight: 'auto', borderRadius: '2rem', backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '40rem', width: 'calc(100% - 8px)' }}>
        <BottomNavigation showLabels value={bottomNavigationValue} style={{ position: 'relative' }}>
          <div style={bottomNavigationHighlightStyle as any}></div>
          <BottomNavigationAction label="Teams" icon={<GroupsIcon />} component={RouterLink} to="teams" />
          <BottomNavigationAction label="Clubs" icon={<SportsVolleyballIcon />} component={RouterLink} to="clubs" />
          <BottomNavigationAction label="Favorieten" icon={<FavoriteIcon />} component={RouterLink} to="favourites" />
          <BottomNavigationAction label="Recent" icon={<RestoreIcon />} component={RouterLink} to="recent" />
        </BottomNavigation>
      </Paper>
    </>
  )
}
