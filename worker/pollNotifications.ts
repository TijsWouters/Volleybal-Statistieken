import type { CountedFetcher, HydraResponseList } from 'worker'

type Notification = {
  forTeamUrl: string
  matchId: string
  result: [number, number]
  teams: [string, string]
  teamUrls: [string, string]
}

type MatchForPoule = {
  uuid: string
  status: {
    waarde: string
  }
  teams: [string, string]
  eindstand: [number, number]
  teamUrls: [string, string]
}

type TeamCache = Map<string, { name: string, url: string }>

export async function getNotifications(seen: Record<string, string[]>, fetcher: CountedFetcher): Promise<Notification[]> {
  const teamCache: TeamCache = new Map<string, { name: string, url: string }>()

  const notifications: Notification[] = []
  for (const teamKey of Object.keys(seen)) {
    if (fetcher.getCount() > 45) {
      console.warn('Stopping notification fetch to avoid too many requests')
      break
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, clubId, teamType, teamId] = teamKey.split('/')
    const seenMatches = seen[teamKey]
    const teamNotifications = await getNotificationsForTeam(clubId, teamType, teamId, seenMatches, fetcher, teamCache)
    notifications.push(...teamNotifications)
  }

  return notifications
}

async function getNotificationsForTeam(clubId: string, teamType: string, teamId: string, seenMatches: string[], fetcher: CountedFetcher, teamCache: TeamCache): Promise<Notification[]> {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 10)
  const dateTwoWeeksAgo = twoWeeksAgo.toISOString().split('T')[0]
  const response = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=desc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&datum%5Bbefore%5D=${date}&status=gespeeld&datum%5Bafter%5D=${dateTwoWeeksAgo}`)

  const data = await response.json() as HydraResponseList<MatchForPoule>
  const matches = data['hydra:member'].filter(m => !seenMatches.includes(m.uuid))
  const matchesWithTeamNames = await addTeamNamesAndUrlToMatches(matches, fetcher, teamCache)

  const notifications: Notification[] = matchesWithTeamNames.map(m => ({
    forTeamUrl: `/${clubId}/${teamType}/${teamId}`,
    matchId: m.uuid,
    result: m.eindstand,
    teams: m.teams,
    teamUrls: m.teamUrls,
  }))

  return notifications
}

async function addTeamNamesAndUrlToMatches(matches: MatchForPoule[], fetcher: CountedFetcher, teamCache: TeamCache): Promise<MatchForPoule[]> {
  return await Promise.all(matches.map(async (m) => {
    const { name: homeTeam, url: homeTeamUrl } = await getTeamNameAndUrl(m.teams[0] as unknown as string, fetcher, teamCache)
    const { name: awayTeam, url: awayTeamUrl } = await getTeamNameAndUrl(m.teams[1] as unknown as string, fetcher, teamCache)
    return {
      ...m,
      teams: [homeTeam, awayTeam],
      teamUrls: [homeTeamUrl, awayTeamUrl],
    }
  }))
}

async function getTeamNameAndUrl(teamId: string, fetcher: CountedFetcher, teamCache: TeamCache): Promise<{ name: string, url: string }> {
  if (teamCache.has(teamId)) {
    return teamCache.get(teamId)!
  }

  const response = await fetcher.fetch(`${teamId}`)
  const data: Team = await response.json()
  const url = getUrlForTeam(data)
  teamCache.set(teamId, { name: data.omschrijving, url })
  return { name: data.omschrijving, url }
}

function getUrlForTeam(team: Team) {
  const parts = team.team.split('/')
  return `/${parts[3]}/${parts[4]}/${parts[5]}`
}
