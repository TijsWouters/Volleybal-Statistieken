import { Typography, IconButton, BottomNavigationAction } from '@mui/material'
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
import AppBar from '@/components/AppBar'
import BottomNavigation from '@/components/BottomNavigation'

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
        >
          <InfoOutline />
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
    </>
  )
}
