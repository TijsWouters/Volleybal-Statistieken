import { getTeamInfo } from './team'
import { getClubWithTeams } from './club'
import { getRandomTeams } from './random'
import { getPlayedMatches } from './playedMatches'
import { getNotifications } from './pollNotifications'
import { getRouteData } from './route'

type SearchRequest = {
  q: string
  type: 'competition'
  exclude: string
}

export type HydraResponseList<T> = {
  'hydra:member': T[]
  'hydra:totalItems': number
}

export type HydraResponse<T> = T

export type NevoboSearchResponse = {
  status: string
  data: { title: string, url: string, type: string }[]
}

export class CountedFetcher {
  count = 0
  async fetch(route: string, init?: RequestInit): Promise<Response> {
    this.count++
    if (this.count > 50) {
      throw new Error('Voor het laden van de data voor dit team zijn meer dan 50 verzoeken nodig. Dit wordt helaas niet ondersteund.')
    }
    // Always ask for JSON-LD (Hydra) format
    init = { ...init, headers: { ...(init?.headers || {}), Accept: 'application/ld+json, application/json;q=0.9, */*;q=0.1' } }
    const response = await fetch(`https://api.nevobo.nl${route}`, init)
    if (response.ok) {
      return response
    }
    else {
      console.error('Nevobo API error:', response.status, response.statusText)
      throw new Error(`Het is niet gelukt om de data op te halen bij de Nevobo API`)
    }
  }

  getCount(): number {
    return this.count
  }
}

// Small JSON helper
function json(
  data: unknown,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

// Optional: CORS helper (enable if you call this Worker directly from browsers)
function withCors(res: Response, allowedOrigin: string): Response {
  const h = new Headers(res.headers)
  // Adjust origin/headers/methods to your needs
  h.set('Access-Control-Allow-Origin', allowedOrigin)
  h.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers: h })
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Handle preflight if you enabled CORS
    if (req.method === 'OPTIONS') {
      return withCors(
        new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Max-Age': '86400',
          },
        }), env.ALLOWED_ORIGIN,
      )
    }

    const url = new URL(req.url)
    // -------------------------
    // GET /api/search?q=...
    // -------------------------
    if (req.method === 'GET' && url.pathname === '/api/search') {
      const q = url.searchParams.get('q')
      if (!q) {
        const res = json({ error: 'Missing query parameter \'q\'' }, 400)
        return withCors(res, env.ALLOWED_ORIGIN)
      }

      const requestBody: SearchRequest = {
        q,
        type: 'competition',
        exclude: '',
      }

      const upstream = await fetch('https://www.volleybal.nl/api/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!upstream.ok) {
        const res = json(
          { error: 'Het is niet gelukt om de zoekresultaten op te halen' },
          upstream.status,
        )
        return withCors(res, env.ALLOWED_ORIGIN)
      }

      const data = (await upstream.json()) as NevoboSearchResponse
      const res = json(data.data, 200)
      return withCors(res, env.ALLOWED_ORIGIN)
    }

    // -------------------------
    // GET /api/random-teams
    // -------------------------
    if (req.method === 'GET' && url.pathname === '/api/random-teams') {
      const kv = env.VOLLEYBAL_STATISTIEKEN_KV

      const teams = await getRandomTeams(kv)
      const res = json({ teams: teams }, 200)
      return withCors(res, env.ALLOWED_ORIGIN)
    }

    // -------------------------
    // GET /api/team/:clubId/:teamType/:teamId
    // -------------------------
    const teamPattern = new URLPattern({
      pathname: '/api/team/:clubId/:teamType/:teamId',
    })
    const match = teamPattern.exec(req.url)
    if (req.method === 'GET' && match) {
      const counted = new CountedFetcher()
      const { clubId, teamType, teamId } = match.pathname.groups as Record<string, string>

      try {
        const response = await getTeamInfo(clubId, teamType, teamId, counted)
        const res = json(response, 200)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('getTeamInfo failed:', message)
        const res = json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
    }

    // -------------------------
    // GET /api/club/:clubId
    // -------------------------
    const clubPattern = new URLPattern({
      pathname: '/api/club/:clubId',
    })
    const clubMatch = clubPattern.exec(req.url)

    if (req.method === 'GET' && clubMatch) {
      const { clubId } = clubMatch.pathname.groups as Record<string, string>
      const counted = new CountedFetcher()

      try {
        const response = await getClubWithTeams(clubId, counted)
        const res = json(response, 200)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('getClubWithTeams failed:', message)
        const res = json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
    }

    // -------------------------
    // GET /api/played-matches/:clubId/:teamType/:teamId
    // -------------------------
    const playedMatchesPattern = new URLPattern({
      pathname: '/api/played-matches/:clubId/:teamType/:teamId',
    })
    const playedMatchesMatch = playedMatchesPattern.exec(req.url)

    if (req.method === 'GET' && playedMatchesMatch) {
      const { clubId, teamType, teamId } = playedMatchesMatch.pathname.groups as Record<string, string>
      const counted = new CountedFetcher()

      try {
        const response = await getPlayedMatches(clubId, teamType, teamId, counted)
        const res = json(response, 200)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('getPlayedMatches failed:', message)
        const res = json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
    }

    // -------------------------
    // GET /poll-notifications
    // -------------------------

    const pollNotificationsPattern = new URLPattern({
      pathname: '/api/poll-notifications',
    })
    const pollNotificationsMatch = pollNotificationsPattern.exec(req.url)

    if (req.method === 'POST' && pollNotificationsMatch) {
      const counted = new CountedFetcher()

      try {
        const response = await getNotifications(await req.json(), counted)
        const res = json(response, 200)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('getNotifications failed:', message)
        const res = json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
    }

    const locationPattern = new URLPattern({
      pathname: '/api/route',
    })
    const locationMatch = locationPattern.exec(req.url)

    if (req.method === 'GET' && locationMatch) {
      const locationId = url.searchParams.get('id')
      const fromClubId = url.searchParams.get('fromClubId')
      if (!locationId || !fromClubId) {
        const res = json({ error: 'Missing query parameter \'id\' or \'fromClubId\'' }, 400)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      const counted = new CountedFetcher()

      try {
        const response = await getRouteData(fromClubId, locationId, counted)
        const res = json(response, 200)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('getLocation failed:', message)
        const res = json({ error: 'Er is iets misgegaan bij het ophalen van de data', message }, 500)
        return withCors(res, env.ALLOWED_ORIGIN)
      }
    }

    // 404
    return withCors(json({ error: 'Not Found' }, 404), env.ALLOWED_ORIGIN)
  },
}
