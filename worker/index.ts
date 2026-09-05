import routes from './routes'

export type HydraResponseList<T> = {
  'hydra:member': T[]
  'hydra:totalItems': number
}

export type HydraResponse<T> = T

export class CountedFetcher {
  count = 0
  async fetch(route: string, init?: RequestInit): Promise<Response> {
    this.count++
    console.log('fetching: ' + route, this.count)
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
export function json(
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

    for (const route of routes) {
      const match = route.pattern.exec(req.url)
      if (req.method === route.method && match) {
        try {
          const response = await route.handler(req, env)
          return withCors(response, env.ALLOWED_ORIGIN)
        }
        catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error('Route handler failed:', message)
          const res = json({ error: 'Er is iets misgegaan bij het verwerken van het verzoek', message }, 500)
          return withCors(res, env.ALLOWED_ORIGIN)
        }
      }
    }

    // 404
    return withCors(json({ error: 'Not Found' }, 404), env.ALLOWED_ORIGIN)
  },
}
