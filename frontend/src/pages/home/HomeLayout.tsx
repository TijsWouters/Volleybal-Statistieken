import { Paper, Typography, AppBar, Toolbar, IconButton, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useEffect, useState } from 'react'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import FavoriteIcon from '@mui/icons-material/Favorite'
import RestoreIcon from '@mui/icons-material/Restore'
import ShareIcon from '@mui/icons-material/Share'
import { Outlet, Link as RouterLink, useLocation } from 'react-router'
import '@/styles/home.css'
import { InfoOutline, NotificationsOutlined } from '@mui/icons-material'

const NAVIGATION_OPTIONS = ['teams', 'clubs', 'favourites', 'recent'] as const
const NAVIGATION_TITLES = ['Teams zoeken', 'Clubs zoeken', 'Favorieten', 'Recent bekeken'] as const

export default function HomeLayout() {
  const location = useLocation()
  const [bottomNavigationValue, setBottomNavigationValue] = useState<number>(0)

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[2] as typeof NAVIGATION_OPTIONS[number]))
    console.log(location.pathname)
  }, [location.pathname])

  return (
    <>
      <AppBar position="static" style={{ backgroundColor: 'var(--color-primary)' }}>
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
            {NAVIGATION_TITLES[bottomNavigationValue]}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
          >
            <NotificationsOutlined />
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
          >
            <ShareIcon />
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
          >
            <InfoOutline />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'block', flexGrow: 1 }}>
        <Outlet />
      </div>
      <Paper elevation={3} style={{ position: 'absolute', bottom: 4, left: 4, right: 4, borderRadius: '2rem', backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <BottomNavigation showLabels value={bottomNavigationValue}>
          <BottomNavigationAction label="Teams" icon={<GroupsIcon />} component={RouterLink} to="teams" />
          <BottomNavigationAction label="Clubs" icon={<SportsVolleyballIcon />} component={RouterLink} to="clubs" />
          <BottomNavigationAction label="Favorieten" icon={<FavoriteIcon />} component={RouterLink} to="favourites" />
          <BottomNavigationAction label="Recent" icon={<RestoreIcon />} component={RouterLink} to="recent" />
        </BottomNavigation>
      </Paper>
    </>
  )
}
