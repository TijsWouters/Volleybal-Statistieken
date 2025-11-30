import { BottomNavigationAction, IconButton, Typography } from '@mui/material'
import { useClubData } from '@/query'
import '@/styles/club.css'
import Loading from '@/components/Loading'
import { useEffect, useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { useLocation, Outlet, Link as RouterLink, useNavigate } from 'react-router'
import FavouriteButton from '@/components/FavouriteButton'
import ShareButton from '@/components/ShareButton'
import NotificationsButton from '@/components/NotificationsButton'
import AppBar from '@/components/AppBar'
import BottomNavigation from '@/components/BottomNavigation'

const NAVIGATION_OPTIONS = ['overview', 'teams'] as const
const NAVIGATION_TITLES = ['Club', 'Teams'] as const

export default function Club() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname.split('/')[3]
  const [bottomNavigationValue, setBottomNavigationValue] = useState<number>(NAVIGATION_OPTIONS.indexOf(path as typeof NAVIGATION_OPTIONS[number]) + 1)
  const { isPending } = useClubData()

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  useEffect(() => {
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[3] as typeof NAVIGATION_OPTIONS[number]) + 1)
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
          <HomeIcon onClick={() => navigate('/', { viewTransition: true })} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {NAVIGATION_TITLES[bottomNavigationValue - 1]}
        </Typography>
        <NotificationsButton />
        <ShareButton />
        <FavouriteButton />
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', paddingTop: '4rem', maxWidth: '1200px', paddingBottom: '2rem' }}>
        {isPending ? <Loading /> : <Outlet />}
      </div>
      <BottomNavigation bottomNavigationValue={bottomNavigationValue}>
        <BottomNavigationAction label="Club" icon={<GroupsIcon />} component={RouterLink} to="overview" viewTransition style={{ flexGrow: 1 }} />
        <BottomNavigationAction label="Teams" icon={<SportsVolleyballIcon />} component={RouterLink} to="teams" viewTransition style={{ flexGrow: 1 }} />
      </BottomNavigation>
    </>
  )
}
