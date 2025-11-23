import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router'
import { useMatchData, useTeamData } from '@/query'
import Loading from '@/components/Loading'
import { useEffect, useMemo } from 'react'
import { AppBar, BottomNavigation, BottomNavigationAction, IconButton, Paper, Toolbar, Typography } from '@mui/material'
import { NotificationsOutlined } from '@mui/icons-material'
import GroupsIcon from '@mui/icons-material/Groups'
import EventNoteIcon from '@mui/icons-material/EventNote'
import ScoreBoardIcon from '@mui/icons-material/Scoreboard'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FavouriteButton from '@/components/FavouriteButton'
import ShareButton from '@/components/ShareButton'

export default function HomeLayout() {
  const location = useLocation()
  const path = location.pathname.split('/')[5]
  const navigate = useNavigate()
  const { data: teamData, isPending } = useTeamData()
  const { data: matchData } = useMatchData()
  const bottomNavigationValue = useMemo(() => pathToNavigationValue(location.pathname.split('/')[5], matchData), [location.pathname, matchData])

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
    console.log(location.state)
  }, [])

  const handleBackClick = () => {
    if (path === 'match' && teamData) {
      if (matchData?.eindstand) {
        navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/results`)
      }
      else {
        navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/matches`)
      }
    }
    else if (path === 'poule' && teamData) {
      navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/standings`)
    }
    else navigate('/')
  }

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
      <AppBar position="static" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            {path === 'match' || path === 'poule' ? <ArrowBackIosNewIcon onClick={handleBackClick} /> : <HomeIcon onClick={handleBackClick} />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {pathToNavigationTitle(location.pathname.split('/')[5], matchData)}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
          >
            <NotificationsOutlined />
          </IconButton>
          <ShareButton />
          <FavouriteButton />
        </Toolbar>
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'block', flexGrow: 1, width: '100%', paddingBottom: '6rem' }}>
        {isPending ? <Loading /> : <Outlet />}
      </div>
      <Paper elevation={3} style={{ position: 'absolute', bottom: 4, marginLeft: 'auto', marginRight: 'auto', borderRadius: '2rem', backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '40rem', width: 'calc(100% - 8px)' }}>
        <BottomNavigation showLabels value={bottomNavigationValue} style={{ position: 'relative' }}>
          <div style={bottomNavigationHighlightStyle as any}></div>
          <BottomNavigationAction label="Team" icon={<GroupsIcon />} component={RouterLink} to="overview" />
          <BottomNavigationAction label="Wedstrijden" icon={<EventNoteIcon />} component={RouterLink} to="matches" />
          <BottomNavigationAction label="Uitslagen" icon={<ScoreBoardIcon />} component={RouterLink} to="results" />
          <BottomNavigationAction label="Standen" icon={<EmojiEventsIcon />} component={RouterLink} to="standings" />
        </BottomNavigation>
      </Paper>
    </>
  )
}

function pathToNavigationValue(path: string, matchData: DetailedMatchInfo | undefined | null): number {
  console.log(matchData?.eindstand ? 2 : 1)
  if (path === 'overview') return 1
  if (path === 'matches') return 2
  if (path === 'results') return 3
  if (path === 'standings') return 4
  if (path === 'match') return matchData?.eindstand ? 3 : 2
  if (path === 'poule') return 4
  return 0
}

function pathToNavigationTitle(path: string, matchData: DetailedMatchInfo | undefined | null): string {
  if (path === 'overview') return 'Team Overzicht'
  if (path === 'matches') return 'Wedstrijden'
  if (path === 'results') return 'Uitslagen'
  if (path === 'standings') return 'Standen'
  if (path === 'match') return matchData?.eindstand ? 'Resultaat' : 'Wedstrijd'
  if (path === 'poule') return 'Poule'
  return 'Volleybal Statistieken'
}
