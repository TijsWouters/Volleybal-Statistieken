import { Outlet, useLocation } from 'react-router'
import { useTeamData } from '@/query'
import Loading from '@/components/Loading'
import { useEffect, useState } from 'react'
import { AppBar, BottomNavigation, BottomNavigationAction, IconButton, Paper, Toolbar, Typography } from '@mui/material'
import { NotificationsOutlined } from '@mui/icons-material'
import GroupsIcon from '@mui/icons-material/Groups'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Link as RouterLink } from 'react-router'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BarChartIcon from '@mui/icons-material/BarChart'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ShareIcon from '@mui/icons-material/Share'

const NAVIGATION_OPTIONS = ['overview', 'matches', 'results', 'standings', 'match'] as const
const NAVIGATION_TITLES = ['Team', 'Wedstrijden', 'Resultaten', 'Standen', 'Wedstrijd'] as const

export default function HomeLayout() {
  const location = useLocation()
  const [bottomNavigationValue, setBottomNavigationValue] = useState<number>(0)
  const { isPending } = useTeamData()

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBottomNavigationValue(NAVIGATION_OPTIONS.indexOf(location.pathname.split('/')[5] as typeof NAVIGATION_OPTIONS[number]))
    console.log(location.pathname)
  }, [location.pathname])

  if (isPending) {
    return <Loading />
  }

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
            <FavoriteIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'block', flexGrow: 1 }}>
        <Outlet />
      </div>
      <Paper elevation={3} style={{ marginBottom: 4, marginLeft: 4, marginRight: 4, borderRadius: '2rem', backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <BottomNavigation value={bottomNavigationValue}>
          <BottomNavigationAction label="Team" icon={<GroupsIcon />} component={RouterLink} to="overview" />
          <BottomNavigationAction label="Wedstrijden" icon={<EventNoteIcon />} component={RouterLink} to="matches" />
          <BottomNavigationAction label="Resultaten" icon={<BarChartIcon />} component={RouterLink} to="results" />
          <BottomNavigationAction label="Standen" icon={<EmojiEventsIcon />} component={RouterLink} to="standings" />
        </BottomNavigation>
      </Paper>
    </>
  )
}
