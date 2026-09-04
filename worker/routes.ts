import { handleClubWithTeams } from './club'
import { handleMatchSummaryOrPreview } from './llm'
import { handlePlayedMatches } from './playedMatches'
import { handleNotifications } from './pollNotifications'
import { handleRouteData } from './route'
import { handleSearch } from './search'
import { handleTeamInfo } from './team'

type Route = {
  method: string
  pattern: URLPattern
  handler: (req: Request, env: Env) => Promise<Response>
}

const routes: Route[] = [
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/search' }),
    handler: handleSearch,
  },
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/team/:clubId/:teamType/:teamId' }),
    handler: handleTeamInfo,
  },
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/club/:clubId' }),
    handler: handleClubWithTeams,
  },
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/played-matches/:clubId/:teamType/:teamId' }),
    handler: handlePlayedMatches,
  },
  {
    method: 'POST',
    pattern: new URLPattern({ pathname: '/api/poll-notifications' }),
    handler: handleNotifications,
  },
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/api/route' }),
    handler: handleRouteData,
  },
  {
    method: 'POST',
    pattern: new URLPattern({ pathname: '/api/llm/match-summary-or-preview' }),
    handler: handleMatchSummaryOrPreview,
  },
]

export default routes
