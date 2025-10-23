import { useContext, useEffect, useState } from 'react'

import { SnackbarContext } from '@/App'

export type StoredEntry = { title: string, url: string, type: 'team' | 'club', seenMatches: string[] }

export function useFavourites() {
  const { setOpenSnackbar, setSnackbarSeverity, setSnackbarText } = useContext(SnackbarContext)
  const STORAGE_KEY = 'volleystats.favourites'
  const MAX = 10

  const [n, setN] = useState<number>(0)
  useEffect(() => { }, [n])

  function load(): StoredEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(t => t && typeof t.title === 'string' && typeof t.url === 'string')
    }
    catch {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
  }

  function save(list: StoredEntry[]) {
    setN(x => x + 1)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
    catch (e) {
      console.warn('Failed to save recent teams', e)
    }
  }

  const favourites: StoredEntry[] = load()

  function addTeamToFavourites(title: string, url: string, seenMatches: string[]) {
    const numFavourites = favourites.length
    if (numFavourites >= MAX) {
      showMaxFavouritesSnackbar()
      return
    }

    const stored: StoredEntry = {
      title,
      url: url.toLocaleLowerCase(),
      type: 'team',
      seenMatches,
    }

    const current = load()
    const filtered = current.filter(t => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)
  }

  function addClubToFavourites(title: string, url: string, seenMatches: string[]) {
    const numFavourites = favourites.length
    if (numFavourites >= MAX) {
      showMaxFavouritesSnackbar()
      return
    }
    const stored: StoredEntry = {
      title,
      url: url.toLocaleLowerCase(),
      type: 'club',
      seenMatches,
    }

    const current = load()
    const filtered = current.filter(t => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)

    favourites.length = 0
    final.forEach(t => favourites.push(t))
  }

  function addToFavourites(title: string, url: string, type: 'team' | 'club') {
    const numFavourites = favourites.length
    if (numFavourites >= MAX) {
      showMaxFavouritesSnackbar()
      return
    }
    const stored: StoredEntry = {
      title: title.split(' - ')[0],
      url: url.toLocaleLowerCase(),
      type,
      seenMatches: [],
    }

    if (type === 'team') {
      initSeenMatchesForTeam(url)
    }

    const current = load()
    const filtered = current.filter(t => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)

    favourites.length = 0
    final.forEach(t => favourites.push(t))
  }

  function removeFavourite(url: string) {
    const current = load()
    const filtered = current.filter(t => t.url !== url.toLowerCase())
    save(filtered)
  }

  function isFavourite(url: string): boolean {
    const current = load()
    return current.some(t => t.url.toLowerCase() === url.toLowerCase())
  }

  async function initSeenMatchesForTeam(url: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/played-matches${url}`)
    if (!response.ok) {
      removeFavourite(url)
      return
    }
    const playedMatches = await response.json() as string[]
    const current = load()
    const updated = current.map((t) => {
      if (t.url === url && t.type === 'team') {
        return { ...t, seenMatches: playedMatches }
      }
      return t
    })
    save(updated)
  }

  async function setSeenMatchesForTeam(url: string, seenMatches: string[]) {
    const current = load()
    const updated = current.map((t) => {
      if (t.url === url && t.type === 'team') {
        return { ...t, seenMatches }
      }
      return t
    })
    save(updated)
  }

  function showMaxFavouritesSnackbar() {
    setSnackbarText(`Je kunt maximaal ${MAX} favoriet${MAX > 1 ? 'en' : ''} toevoegen.`)
    setSnackbarSeverity('error')
    setOpenSnackbar(true)
  }

  return { favourites, addTeamToFavourites, addClubToFavourites, removeFavourite, isFavourite, addToFavourites, setSeenMatchesForTeam }
}
