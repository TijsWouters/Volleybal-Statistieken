import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router'
import { useMatchData, useTeamData } from '@/query'
import Loading from '@/components/Loading'
import { createContext, useEffect, useMemo, useState } from 'react'
import { BottomNavigationAction, IconButton, Typography } from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import EventNoteIcon from '@mui/icons-material/EventNote'
import ScoreBoardIcon from '@mui/icons-material/Scoreboard'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FavouriteButton from '@/components/FavouriteButton'
import ShareButton from '@/components/ShareButton'
import NotificationsButton from '@/components/NotificationsButton'
import AppBar from '@/components/AppBar'
import BottomNavigation from '@/components/BottomNavigation'

export const AllMatchesContext = createContext<{ allMatches: boolean, setAllMatches: React.Dispatch<React.SetStateAction<boolean>> }>({ allMatches: false, setAllMatches: () => {} })

export default function HomeLayout() {
  const location = useLocation()
  const path = location.pathname.split('/')[5]
  const navigate = useNavigate()
  const { data: teamData, isPending } = useTeamData()
  const matchData = useMatchData()
  const bottomNavigationValue = useMemo(() => pathToNavigationValue(location.pathname.split('/')[5], matchData), [location.pathname, matchData])

  const [allMatches, setAllMatches] = useState(false)

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
  }, [])

  const handleBackClick = () => {
    if (path === 'match' && teamData) {
      if (matchData?.eindstand) {
        navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/results?allMatches=${allMatches}`, { viewTransition: true })
      }
      else {
        navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/matches?allMatches=${allMatches}`, { viewTransition: true })
      }
    }
    else if (path === 'poule' && teamData) {
      navigate(`/team/${teamData.clubId}/${teamData.teamType}/${teamData.teamId}/standings`, { viewTransition: true })
    }
    else navigate('/')
  }

  return (
    <AllMatchesContext.Provider value={{ allMatches, setAllMatches }}>
      <AppBar>
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
        <NotificationsButton />
        <ShareButton />
        <FavouriteButton />
      </AppBar>
      <div style={{ overflowY: 'auto', display: 'flex', flexGrow: 1, width: '100%', viewTransitionName: 'page-content', paddingTop: '4rem', flexDirection: 'column', paddingBottom: '6rem' }}>
        {isPending ? <Loading /> : <Outlet />}
      </div>
      <BottomNavigation bottomNavigationValue={bottomNavigationValue}>
        <BottomNavigationAction label="Team" icon={<GroupsIcon />} component={RouterLink} to="overview" viewTransition />
        <BottomNavigationAction label="Wedstrijden" icon={<EventNoteIcon />} component={RouterLink} to={`matches?allMatches=${allMatches}`} viewTransition />
        <BottomNavigationAction label="Uitslagen" icon={<ScoreBoardIcon />} component={RouterLink} to={`results?allMatches=${allMatches}`} viewTransition />
        <BottomNavigationAction label="Standen" icon={<EmojiEventsIcon />} component={RouterLink} to="standings" viewTransition />
      </BottomNavigation>
    </AllMatchesContext.Provider>
  )
}

function pathToNavigationValue(path: string, matchData: DetailedMatchInfo | undefined | null): number {
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
