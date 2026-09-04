import { fetcher, type HydraResponseList, type HydraResponse, json } from './index'

import { getClubInfo } from './club'

export async function handleTeamInfo(req: Request): Promise<Response> {
  const teamPattern = new URLPattern({ pathname: '/api/team/:clubId/:teamType/:teamId' })
  const match = teamPattern.exec(req.url)
  const { clubId, teamType, teamId } = match!.pathname.groups as Record<string, string>

  if (!clubId || !teamType || !teamId) {
    return new Response('Missing required query parameters', { status: 400 })
  }

  const teamInfo = await getTeamInfo(clubId, teamType, teamId)
  return json(teamInfo, 200)
}

async function getTeamInfo(clubId: string, teamType: string, teamId: string): Promise<ApiResponse> {
  const [poules, club] = await Promise.all([
    getPoulesAndMatches(clubId, teamType, teamId),
    getClubInfo(clubId),
  ])
  return { club, poules }
}

async function getPoulesAndMatches(clubId: string, teamType: string, teamId: string) {
  const poules = await getPoules(clubId, teamType, teamId)

  await Promise.all([
    addNamesToPoules(poules),
    addTeamsToPoules(poules),
  ])

  return addMatchesToPoules(poules)
}

// We can query 30 matches per page
async function addMatchesToPoules(poules: Poule[]) {
  return Promise.all(poules.map(async (p) => {
    const firstResponse = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}`)
    const firstJson = await firstResponse.json() as HydraResponseList<Match>
    const totalMatches = firstJson['hydra:totalItems']

    const totalPages = Math.ceil(totalMatches / 30)
    let matches = firstJson['hydra:member']
    if (totalPages > 1) {
      const fetches = []
      for (let page = 2; page <= totalPages; page++) {
        fetches.push(fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}&page=${page}`))
      }

      const extraRequests = (await Promise.all(fetches))
      const allJson: HydraResponseList<Match>[] = await Promise.all(extraRequests.map(r => r.json())) as HydraResponseList<Match>[]
      allJson.forEach(m => matches.push(...m['hydra:member'])) // Flatten
    }
    matches = matches.filter(m => !(m.status.waarde === 'vervallen'))
    p.matches = addTeamDataToMatches(p, matches)
    p.matches.forEach(m => m.pouleName = p.name)
    return p
  }))
}

function addTeamDataToMatches(poule: Poule, matches: Match[]): Match[] {
  for (const match of matches) {
    const homeTeam = match.teams[0] as unknown as string
    const awayTeam = match.teams[1] as unknown as string
    const homeData = poule.teams.find(t => t['@id'] === homeTeam)
    const awayData = poule.teams.find(t => t['@id'] === awayTeam)
    match.teams = [homeData!, awayData!]
  }
  return matches
}

async function addNamesToPoules(poules: Poule[]) {
  return Promise.all(poules.map(async (p) => {
    const response = await fetcher.fetch(`${p.poule}`)
    const pouleData: HydraResponse<Poule> = await response.json()
    p.name = pouleData.omschrijving
    p.puntentelmethode = pouleData.puntentelmethode
    p.standberekening = pouleData.standberekening
    p.pdRegeling = pouleData.pdRegeling
    return p
  }))
}

export async function getPoules(clubId: string, teamType: string, teamId: string): Promise<Poule[]> {
  const response = await fetcher.fetch(`/competitie/pouleindelingen?team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}`)
  const hydraData = await response.json() as HydraResponseList<Poule>
  const data = hydraData['hydra:member']
  return data
}

// Can fetch 30 per page
async function addTeamsToPoules(poules: Poule[]) {
  return Promise.all(poules.map(async (p) => {
    const response = await fetcher.fetch(`/competitie/pouleindelingen?poule=${p.poule}`)
    const data: HydraResponseList<Team> = await response.json()
    p.teams = data['hydra:member']

    if (data['hydra:totalItems'] > 30) {
      const totalPages = Math.ceil(data['hydra:totalItems'] / 30)
      const fetches = []
      for (let page = 2; page <= totalPages; page++) {
        fetches.push(fetcher.fetch(`/competitie/pouleindelingen?poule=${p.poule}&page=${page}`))
      }

      const extraResponses = await Promise.all(fetches)
      const allData = await Promise.all(extraResponses.map(r => r.json())) as HydraResponseList<Team>[]
      allData.forEach(d => p.teams.push(...d['hydra:member']))
    }

    return p
  }))
}
