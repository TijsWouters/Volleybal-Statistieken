import { AppBar, BottomNavigation, BottomNavigationAction, IconButton, Paper, Toolbar, Typography } from '@mui/material'
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[3] as typeof NAVIGATION_OPTIONS[number]) + 1)
    console.log(location.pathname)
  }, [location.pathname])

  const bottomNavigationHighlightStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'var(--color-accent)',
    width: '50%',
    height: '100%',
    borderRadius: '2rem',
    transition: 'transform 0.3s ease',
    transform: `translateX(${(bottomNavigationValue - 1) * 100}%) scale(1)`,
    zIndex: 0,
  }

  return (
    <>
      <AppBar position="fixed" style={{ backgroundColor: 'var(--color-primary)', color: 'white', height: '4rem' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <HomeIcon onClick={() => navigate('/')} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {NAVIGATION_TITLES[bottomNavigationValue - 1]}
          </Typography>
          <NotificationsButton />
          <ShareButton />
          <FavouriteButton />
        </Toolbar>
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', paddingBottom: '6rem', paddingTop: '4rem' }}>
        {isPending ? <Loading /> : <Outlet />}
      </div>
      <Paper elevation={3} style={{ position: 'fixed', bottom: 4, marginLeft: 'auto', marginRight: 'auto', borderRadius: '2rem', backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '40rem', width: 'calc(100% - 8px)' }}>
        <BottomNavigation showLabels value={bottomNavigationValue} style={{ position: 'relative' }}>
          <div style={bottomNavigationHighlightStyle as any}></div>
          <BottomNavigationAction label="Club" icon={<GroupsIcon />} component={RouterLink} to="overview" />
          <BottomNavigationAction label="Teams" icon={<SportsVolleyballIcon />} component={RouterLink} to="teams" />
        </BottomNavigation>
      </Paper>
    </>
  )
}
