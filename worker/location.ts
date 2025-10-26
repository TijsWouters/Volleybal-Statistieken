import type { CountedFetcher } from './index'

export async function getLocation(locationId: string, fetcher: CountedFetcher): Promise<Location> {
  const response = await fetcher.fetch(`${locationId}`)
  const data = await response.json() as Location
  return data
}
