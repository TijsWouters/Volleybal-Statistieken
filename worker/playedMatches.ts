import { fetcher, json, type HydraResponseList } from './index'

export async function handlePlayedMatches(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const clubId = url.searchParams.get('clubId')
  const teamType = url.searchParams.get('teamType')
  const teamId = url.searchParams.get('teamId')

  if (!clubId || !teamType || !teamId) {
    return new Response('Missing required query parameters', { status: 400 })
  }

  try {
    const playedMatches = await getPlayedMatches(clubId, teamType, teamId)
    return json(playedMatches, 200)
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('getPlayedMatches failed:', message)
    return json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
  }
}

async function getPlayedMatches(clubId: string, teamType: string, teamId: string): Promise<string[]> {
  const response = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=desc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&status=gespeeld`)

  const data = await response.json() as HydraResponseList<{ uuid: string }>
  const matches = data['hydra:member']
  return matches.map(m => m.uuid)
}
