import type { StoredEntry } from './useFavourites'

export type MatchNotification = {
  forTeamUrl: string
  matchId: string
  result: [number, number]
  teams: [string, string]
  teamUrls: [string, string]
}

import { useCallback, useEffect, useState } from 'react'

const NOTIFICATIONS_KEY = 'volleystats.lastNotifications'
const LAST_CHECK_KEY = 'volleystats.lastNotificationCheck'
const FAVOURITES_KEY = 'volleystats.favourites'

type Listener = () => void
const listeners = new Set<Listener>()

function emitChange() {
  listeners.forEach(listener => listener())
}

function loadSeenMatches(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredEntry[]
    if (!Array.isArray(parsed)) return {}

    const seenMap: Record<string, string[]> = {}
    for (const favourite of parsed) {
      if (favourite.type === 'team' && Array.isArray(favourite.seenMatches)) {
        seenMap[favourite.url] = favourite.seenMatches
      }
    }
    return seenMap
  }
  catch {
    // old cleanup, keep if you want
    localStorage.removeItem('volleystats.seenMatches')
    return {}
  }
}

function getRawNotificationsFromStorage(): MatchNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MatchNotification[]
    if (!Array.isArray(parsed)) return []
    return parsed
  }
  catch {
    return []
  }
}

/**
 * Single source of truth:
 * - All notifications are stored in localStorage
 * - We always derive the current list from localStorage + seenMatches
 */
function getSnapshot(): MatchNotification[] {
  const seen = loadSeenMatches()
  const all = getRawNotificationsFromStorage()

  return all.filter((n) => {
    return !(seen[n.forTeamUrl] && seen[n.forTeamUrl].includes(n.matchId))
  })
}

async function fetchNotifications(seen: Record<string, string[]>): Promise<MatchNotification[]> {
  if (Object.keys(seen).length === 0) {
    return []
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/poll-notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(seen),
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json() as MatchNotification[]
  return data
}

function updateFavourites(mutator: (entries: StoredEntry[]) => StoredEntry[]) {
  const raw = localStorage.getItem(FAVOURITES_KEY)
  if (!raw) return
  const parsed = JSON.parse(raw) as StoredEntry[]
  if (!Array.isArray(parsed)) return

  const updated = mutator(parsed)
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated))
}

export function useMatchNotifications(doFetch: boolean = true) {
  // Local state is just a view over localStorage
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>(() => getSnapshot())

  // Subscribe to our in-memory listeners + `storage` events
  useEffect(() => {
    function handleChange() {
      setMatchNotifications(getSnapshot())
    }

    listeners.add(handleChange)

    // keep other tabs/windows in sync as well
    const handleStorage = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_KEY || e.key === FAVOURITES_KEY) {
        handleChange()
      }
    }
    window.addEventListener('storage', handleStorage)

    // just in case something changed before subscription
    handleChange()

    return () => {
      listeners.delete(handleChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Initial fetch / cache logic
  useEffect(() => {
    if (!doFetch) {
      return
    }
    const seen = loadSeenMatches()
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)

    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60)

      if (diffMinutes < 5) {
        // State is already synced via getSnapshot(), nothing else to do
        return
      }
    }

    fetchNotifications(seen).then((newNotifications) => {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications))
      localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
      emitChange()
    })
  }, [])

  const addSeenMatches = useCallback((matches: Record<string, string[]>) => {
    updateFavourites(entries =>
      entries.map((favourite) => {
        if (matches[favourite.url] && favourite.type === 'team') {
          if (!Array.isArray(favourite.seenMatches)) {
            favourite.seenMatches = []
          }
          favourite.seenMatches.push(...matches[favourite.url])
          favourite.seenMatches = Array.from(new Set(favourite.seenMatches))
        }
        return favourite
      }),
    )

    emitChange()
  }, [])

  const deleteNotification = useCallback((teamUrl: string, matchId: string) => {
    // Option 1: physically remove notification from storage
    const all = getRawNotificationsFromStorage()
    const filtered = all.filter(n => !(n.forTeamUrl === teamUrl && n.matchId === matchId))
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered))

    // Optionally also mark as seen (depends on your semantics)
    updateFavourites(entries =>
      entries.map((favourite) => {
        if (favourite.type === 'team' && favourite.url === teamUrl) {
          if (!Array.isArray(favourite.seenMatches)) {
            favourite.seenMatches = []
          }
          if (!favourite.seenMatches.includes(matchId)) {
            favourite.seenMatches.push(matchId)
          }
        }
        return favourite
      }),
    )

    emitChange()
  }, [])

  return { matchNotifications, deleteNotification, addSeenMatches }
}
