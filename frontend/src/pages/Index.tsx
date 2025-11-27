// indexLoader.ts
import { redirect } from 'react-router'

const STORAGE_KEY = 'volleystats.favourites'

export default async function indexLoader() {
  let favouriteCount = 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    favouriteCount = parsed.filter(t => t && typeof t.title === 'string' && typeof t.url === 'string').length
  }
  catch {
    localStorage.removeItem(STORAGE_KEY)
    favouriteCount = 0
  }

  if (favouriteCount > 0) {
    return redirect('/home/favourites')
  }

  return redirect('/home/teams')
}
