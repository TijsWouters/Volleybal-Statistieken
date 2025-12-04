import { useEffect, useState } from 'react'

import type { StoredEntry } from './useFavourites'

export type MatchNotification = {
  forTeamUrl: string
  matchId: string
  result: [number, number]
  teams: [string, string]
  teamUrls: [string, string]
}

export function useMatchNotifications() {
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>([])

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
    const lastCheck = localStorage.lastNotificationCheck
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60)
      if (diffMinutes < 15) {
        return
      }
    }
    fetchNotifications(seen).then((newNotifications) => {
      setMatchNotifications(newNotifications)
      localStorage.lastNotificationCheck = new Date().toISOString()
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
      favourite.seenMatches = Array.from(new Set(favourite.seenMatches))
      return favourite
    })
    localStorage.setItem('volleystats.favourites', JSON.stringify(updated))
    setMatchNotifications(prev => prev.filter((n) => {
      return !(matches[n.forTeamUrl] && matches[n.forTeamUrl].includes(n.matchId))
    }))
  }

  function deleteNotification(teamUrl: string, matchId: string) {
    setMatchNotifications(prev => prev.filter(n => n.matchId !== matchId))
    addSeenMatch(teamUrl, matchId)
  }

  function deleteAllNotifications() {
    const matches: Record<string, string[]> = {}
    for (const notification of matchNotifications) {
      if (!matches[notification.forTeamUrl]) {
        matches[notification.forTeamUrl] = []
      }
      matches[notification.forTeamUrl].push(notification.matchId)
    }
    addSeenMatches(matches)
    setMatchNotifications([])
  }

  return { matchNotifications, deleteNotification, deleteAllNotifications, addSeenMatches }
}
