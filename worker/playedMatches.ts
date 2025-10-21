import { getPoules } from './team'
import type { CountedFetcher, HydraResponseList } from 'worker';

export async function getPlayedMatches(clubId: string, teamType: string, teamId: string, fetcher: CountedFetcher): Promise<string[]> {
	const poules = await getPoules(clubId, teamType, teamId, fetcher);
  console.log("Fetched poules:", poules.length);
  const poulesWithMatches = await addMatchesToPoulesWithoutTeamData(poules, fetcher);
  console.log("Added matches to poules", poulesWithMatches);
  const matches = poulesWithMatches.flatMap(p => p.matches || []);
  console.log("Total matches found:", matches.length);
  const playedMatchIds = matches
    .filter(m => m.status.waarde.toLowerCase() === 'gespeeld')
    .map(m => m.uuid);
  return playedMatchIds;
}

async function addMatchesToPoulesWithoutTeamData(poules: Poule[], fetcher: CountedFetcher) {
	return Promise.all(poules.map(async (p) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const firstResponse = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&datum%5Bbefore%5D=${date}&poule=${p.poule}`)
		const firstJson = await firstResponse.json() as HydraResponseList<Match>
		const totalMatches = firstJson['hydra:totalItems']

		const totalPages = Math.ceil(totalMatches / 30)
		const matches = firstJson['hydra:member']
		if (totalPages > 1) {
			const fetches = []
			for (let page = 2; page <= totalPages; page++) {
				fetches.push(fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&datum%5Bbefore%5D=${date}&poule=${p.poule}&page=${page}`))
			}

			const extraRequests = (await Promise.all(fetches))
			const allJson: HydraResponseList<Match>[] = await Promise.all(extraRequests.map(r => r.json())) as HydraResponseList<Match>[]
			allJson.forEach(m => matches.push(...m['hydra:member'])) // Flatten
		}
    p.matches = matches
		return p
	}))
}
