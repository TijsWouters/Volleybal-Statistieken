import { json } from './index'

type SearchRequest = {
  q: string
  type: 'competition'
  exclude: string
}

export type NevoboSearchResponse = {
  status: string
  data: { title: string, url: string, type: string }[]
}

export async function handleSearch(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')

  const requestBody: SearchRequest = {
    q: q || '',
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
    throw new Error(`Upstream search request failed with status ${upstream.status}`)
  }

  const data = (await upstream.json()) as NevoboSearchResponse
  return json(data.data, 200)
}
