import { useEffect, useState } from "react";

type StoredEntry = { title: string; url: string, type: 'team' | 'club' }

type UseFavourites = {
  favourites: StoredEntry[];
  addTeamToFavourites: (title: string, url: string) => void;
  addClubToFavourites: (title: string, url: string) => void;
  removeFavourite: (url: string) => void;
  isFavourite: (url: string) => boolean;
  addToFavourites: (title: string, url: string, type: 'team' | 'club') => void;
}

export function useFavourites(): UseFavourites {
  const STORAGE_KEY = 'volleystats.favourites'
  const MAX = Infinity

  const [n, setN] = useState<number>(0)
  useEffect(() => {}, [n])

  function load(): StoredEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((t) => t && typeof t.title === 'string' && typeof t.url === 'string')
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
  }

  function save(list: StoredEntry[]) {
    setN((x) => x + 1)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn('Failed to save recent teams', e)
    }
  }

  const favourites: StoredEntry[] = load()

  function addTeamToFavourites(title: string, url: string) {
    const stored: StoredEntry = {
      title,
      url,
      type: 'team',
    }

    const current = load()
    const filtered = current.filter((t) => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)

    save(final)

    favourites.length = 0
    final.forEach((t) => favourites.push(t))
  }

  function addClubToFavourites(title: string, url: string) {
    const stored: StoredEntry = {
      title,
      url,
      type: 'club',
    }

    const current = load()
    const filtered = current.filter((t) => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)

    favourites.length = 0
    final.forEach((t) => favourites.push(t))
  }

  function addToFavourites(title: string, url: string, type: 'team' | 'club') {
    const stored: StoredEntry = {
      title,
      url,
      type,
    }

    const current = load()
    const filtered = current.filter((t) => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)

    favourites.length = 0
    final.forEach((t) => favourites.push(t))
  }

  function removeFavourite(url: string) {
    const current = load()
    const filtered = current.filter((t) => t.url !== url)
    save(filtered)
  }

  function isFavourite(url: string): boolean {
    const current = load()
    return current.some((t) => t.url.toLowerCase() === url.toLowerCase())
  }

  return { favourites, addTeamToFavourites, addClubToFavourites, removeFavourite, isFavourite, addToFavourites }
}
