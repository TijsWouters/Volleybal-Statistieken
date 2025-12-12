import type { CountedFetcher } from './index'
import { getClubInfo } from './club'

export async function getRouteData(fromClubId: string, toLocationId: string, fetcher: CountedFetcher): Promise<RouteResponse> {
  const locationResponse = await fetcher.fetch(`${toLocationId}`)
  const clubInfo = await getClubInfo(fromClubId, fetcher)
  const locationData = await locationResponse.json() as Location
  return { clubInfo, locationData }
}
