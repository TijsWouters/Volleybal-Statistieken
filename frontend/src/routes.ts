import { createBrowserRouter, redirect, type RouteObject } from 'react-router'

import { App } from './App'

// top-level pages
import Index from './pages/Index'

// home
import HomeLayout from './pages/home/HomeLayout'
import TeamSearch from './pages/home/TeamSearch'
import ClubSearch from './pages/home/ClubSearch'
import Favourites from './pages/home/Favourites'
import Recent from './pages/home/Recent'

// club
import ClubLayout from './pages/club/ClubLayout'
import ClubOverview from './pages/club/ClubOverview'
import ClubTeams from './pages/club/ClubTeams'

// team
import TeamLayout from './pages/team/TeamLayout'
import TeamOverview from './pages/team/teamOverview/TeamOverview'
import TeamSchedule from './pages/team/teamMatches/TeamSchedule'
import TeamResults from './pages/team/teamMatches/TeamResults'
import TeamStandings from './pages/team/teamStandings/TeamStandings'
import MatchPage from './pages/team/match/MatchPage'
import PoulePage from './pages/team/poule/PoulePage'

const routes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        loader: Index,
      },
      {
        path: 'home',
        Component: HomeLayout,
        children: [
          { path: 'teams', Component: TeamSearch },
          { path: 'clubs', Component: ClubSearch },
          { path: 'favourites', Component: Favourites },
          { path: 'recent', Component: Recent },
          { path: '*', loader: () => { return redirect('/home/teams') } },
        ],
      },
      {
        path: 'club/:clubId',
        Component: ClubLayout,
        children: [
          { path: 'overview', Component: ClubOverview },
          { path: 'teams', Component: ClubTeams },
          { path: '*', loader: () => { return redirect('/') } },
        ],
      },
      {
        path: 'team/:clubId/:teamType/:teamId',
        Component: TeamLayout,
        children: [
          { path: 'overview', Component: TeamOverview },
          { path: 'matches', Component: TeamSchedule },
          { path: 'results', Component: TeamResults },
          { path: 'standings', Component: TeamStandings },
          { path: 'match/:matchUuid', Component: MatchPage },
          { path: 'poule', Component: PoulePage },
          { path: '*', loader: () => { return redirect('/') } },
        ],
      },
    ],
  },
  { path: '*', loader: () => { return redirect('/home/teams') } },
]

export const router = createBrowserRouter(routes)
