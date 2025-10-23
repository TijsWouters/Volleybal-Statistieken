import type { CountedFetcher, HydraResponseList } from 'worker'

export async function getPlayedMatches(clubId: string, teamType: string, teamId: string, fetcher: CountedFetcher): Promise<string[]> {
  const response = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=desc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&status=gespeeld`)

  const data = await response.json() as HydraResponseList<{ uuid: string }>
  const matches = data['hydra:member']
  return matches.map(m => m.uuid)
}
