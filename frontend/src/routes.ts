import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  layout('./App.tsx', [
    index('./pages/Index.tsx'),
    route('home', './pages/home/HomeLayout.tsx', [
      route('teams', './pages/home/TeamSearch.tsx'),
      route('clubs', './pages/home/ClubSearch.tsx'),
      route('favourites', './pages/home/Favourites.tsx'),
      route('recent', './pages/home/Recent.tsx'),
    ]),
    route('club/:clubId', './pages/club/ClubLayout.tsx', [
      route('overview', './pages/club/ClubOverview.tsx'),
      route('teams', './pages/club/ClubTeams.tsx'),
    ]),
    route('team/:clubId/:teamType/:teamId', './pages/team/TeamLayout.tsx', [
      route('overview', './pages/team/teamOverview/TeamOverview.tsx'),
      route('matches', './pages/team/teamMatches/TeamSchedule.tsx'),
      route('results', './pages/team/teamMatches/TeamResults.tsx'),
      route('standings', './pages/team/teamStandings/TeamStandings.tsx'),
      route('match/:matchUuid', './pages/team/match/MatchPage.tsx'),
      route('poule', './pages/team/poule/PoulePage.tsx'),
    ]),
  ]),
] satisfies RouteConfig
