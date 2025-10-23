import { useEffect, useState } from 'react'

import type { StoredEntry } from './useFavourites'

type Notification = {
  forTeamUrl: string
  matchId: string
  result: [number, number]
  teams: [string, string]
  teamUrls: [string, string]
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  async function fetchNotifications(seen: Record<string, string[]>): Promise<Notification[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/poll-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seen),
    })
    const data = await response.json() as Notification[]
    return data
  }

  function loadSeenMatches(): Record<string, string[]> {
    try {
      const raw = localStorage.getItem('volleystats.favourites')
      if (!raw) return {}
      const parsed = JSON.parse(raw) as StoredEntry[]
      if (!Array.isArray(parsed)) return {}
      const seenMap = {} as Record<string, string[]>
      for (const favourite of parsed) {
        if (favourite.type === 'team' && Array.isArray(favourite.seenMatches)) {
          seenMap[favourite.url] = favourite.seenMatches
        }
      }
      return seenMap
    }
    catch {
      localStorage.removeItem('volleystats.seenMatches')
      return {}
    }
  }

  useEffect(() => {
    const seen = loadSeenMatches()
    fetchNotifications(seen).then((newNotifications) => {
      setNotifications(newNotifications)
    })
  }, [])

  function addSeenMatch(teamUrl: string, matchId: string) {
    const raw = localStorage.getItem('volleystats.favourites')
    if (!raw) return
    const parsed = JSON.parse(raw) as StoredEntry[]
    if (!Array.isArray(parsed)) return
    const updated = parsed.map((favourite) => {
      if (favourite.type === 'team' && favourite.url === teamUrl) {
        if (!Array.isArray(favourite.seenMatches)) {
          favourite.seenMatches = []
        }
        if (!favourite.seenMatches.includes(matchId)) {
          favourite.seenMatches.push(matchId)
        }
      }
      return favourite
    })
    localStorage.setItem('volleystats.favourites', JSON.stringify(updated))
  }

  function addSeenMatches(matches: Record<string, string[]>) {
    const raw = localStorage.getItem('volleystats.favourites')
    if (!raw) return
    const parsed = JSON.parse(raw) as StoredEntry[]
    if (!Array.isArray(parsed)) return
    const updated = parsed.map((favourite) => {
      if (matches[favourite.url] && favourite.type === 'team') {
        if (!Array.isArray(favourite.seenMatches)) {
          favourite.seenMatches = []
        }
        favourite.seenMatches.push(...matches[favourite.url])
      }
      return favourite
    })
    localStorage.setItem('volleystats.favourites', JSON.stringify(updated))
  }

  function deleteNotification(teamUrl: string, matchId: string) {
    setNotifications(prev => prev.filter(n => n.matchId !== matchId))
    addSeenMatch(teamUrl, matchId)
  }

  function deleteAllNotifications() {
    const matches: Record<string, string[]> = {}
    for (const notification of notifications) {
      if (!matches[notification.forTeamUrl]) {
        matches[notification.forTeamUrl] = []
      }
      matches[notification.forTeamUrl].push(notification.matchId)
    }
    addSeenMatches(matches)
    setNotifications([])
  }

  return { notifications, deleteNotification, deleteAllNotifications }
}
