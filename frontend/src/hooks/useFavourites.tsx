import { useContext, useState } from 'react'

import { SnackbarContext } from '@/App'

export type StoredEntry = { title: string, url: string, type: 'team' | 'club', seenMatches: string[] }

type UseFavouritesType = {
  favourites: StoredEntry[]
  addTeamToFavourites: (title: string, url: string, seenMatches: string[]) => void
  addClubToFavourites: (title: string, url: string, seenMatches: string[]) => void
  removeFavourite: (url: string) => void
  isFavourite: (url: string) => boolean
  addToFavourites: (title: string, url: string, type: 'team' | 'club') => void
  setSeenMatchesForTeam: (url: string, seenMatches: string[]) => void
}

export function useFavourites(): UseFavouritesType {
  const scnackBarCtx = useContext(SnackbarContext)
  const STORAGE_KEY = 'volleystats.favourites'
  const MAX = 10

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

  const [favourites, setFavourites] = useState<StoredEntry[]>(load())

  function save(list: StoredEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      setFavourites(list)
    }
    catch (e) {
      console.warn('Failed to save recent teams', e)
    }
  }

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

    setFavourites(final)
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

    setFavourites(final)
  }

  function removeFavourite(url: string) {
    const current = load()
    const filtered = current.filter(t => t.url !== url.toLowerCase())
    save(filtered)
  }

  function isFavourite(url: string): boolean {
    return favourites.some(t => t.url.toLowerCase() === url.toLowerCase())
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

  function setSeenMatchesForTeam(url: string, seenMatches: string[]) {
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
    if (!scnackBarCtx) return
    scnackBarCtx.setSnackbarText(`Je kunt maximaal ${MAX} favoriet${MAX > 1 ? 'en' : ''} toevoegen.`)
    scnackBarCtx.setSnackbarSeverity('error')
    scnackBarCtx.setOpenSnackbar(true)
  }

  return { favourites, addTeamToFavourites, addClubToFavourites, removeFavourite, isFavourite, addToFavourites, setSeenMatchesForTeam }
}
