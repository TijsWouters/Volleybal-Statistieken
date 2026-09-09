import { CountedFetcher, json } from './index'
import { getClubInfo } from './club'

export async function handleRouteData(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const fromClubId = url.searchParams.get('fromClubId')
  const toLocationId = url.searchParams.get('id')
  const fetcher = new CountedFetcher()

  if (!fromClubId || !toLocationId) {
    return new Response('Missing required query parameters', { status: 400 })
  }

  try {
    const routeData = await getRouteData(fromClubId, toLocationId, fetcher)
    return json(routeData, 200)
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('getRouteData failed:', message)
    return json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
  }
}

async function getRouteData(fromClubId: string, toLocationId: string, fetcher: CountedFetcher): Promise<RouteResponse> {
  const locationResponse = await fetcher.fetch(`${toLocationId}`)
  const clubInfo = await getClubInfo(fromClubId, fetcher)
  const locationData = await locationResponse.json() as Location
  return { clubInfo, locationData }
}
