import { CountedFetcher, HydraResponseList, json } from './index'

export async function handleClubWithTeams(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const clubId = url.pathname.split('/').pop()
  const fetcher = new CountedFetcher()

  try {
    const clubWithTeams = await getClubWithTeams(clubId!, fetcher)
    return json(clubWithTeams, 200)
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('getClubWithTeams failed:', message)
    return json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
  }
}

export async function getClubInfo(clubId: string, fetcher: CountedFetcher): Promise<Club> {
  const response = await fetcher.fetch(`/relatiebeheer/verenigingen/${clubId}`)
  const data: Club = await response.json()
  return data
}

async function getClubWithTeams(clubId: string, fetcher: CountedFetcher): Promise<ClubWithTeams> {
  const club = await getClubInfo(clubId, fetcher)
  const clubWithTeams = await addTeamsToClub(club, fetcher)
  return clubWithTeams
}

async function addTeamsToClub(club: Club, fetcher: CountedFetcher): Promise<ClubWithTeams> {
  const response = await fetcher.fetch(`/competitie/teams?vereniging=${club['@id']}`)
  const data: HydraResponseList<TeamForClub> = await response.json()
  const clubWithTeams: ClubWithTeams = { ...club, teams: data['hydra:member'] }

  if (data['hydra:totalItems'] > 30) {
    const totalPages = Math.ceil(data['hydra:totalItems'] / 30)
    const fetches = []
    for (let page = 2; page <= totalPages; page++) {
      fetches.push(fetcher.fetch(`/competitie/teams?vereniging=${club['@id']}&page=${page}`))
    }

    const extraResponses = await Promise.all(fetches)
    const allData = await Promise.all(extraResponses.map(r => r.json())) as HydraResponseList<TeamForClub>[]
    allData.forEach(d => clubWithTeams.teams.push(...d['hydra:member']))
  }

  return clubWithTeams
}
