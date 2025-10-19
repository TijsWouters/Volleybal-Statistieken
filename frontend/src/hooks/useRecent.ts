type StoredEntry = { title: string; url: string, type: 'team' | 'club' }

export function useRecent(): { recent: StoredEntry[]; addTeamToRecent: (title: string, url: string) => void; addClubToRecent: (club: Club) => void } {
  const STORAGE_KEY = 'volleystats.recent'
  const MAX = Infinity

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn('Failed to save recent teams', e)
    }
  }

  const recent: StoredEntry[] = load()

  function addTeamToRecent(title: string, url: string) {
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

    recent.length = 0
    final.forEach((t) => recent.push(t))
  }

  function addClubToRecent(club: Club) {
    const stored: StoredEntry = {
      title: club.naam,
      url: `/${club['@id'].split('/').filter(Boolean).slice(-1)}`,
      type: 'club',
    }

    const current = load()
    const filtered = current.filter((t) => t.url !== stored.url)
    filtered.push(stored)

    const final = filtered.slice(-MAX)
    save(final)

    recent.length = 0
    final.forEach((t) => recent.push(t))
  }

  return { recent, addTeamToRecent, addClubToRecent }
}
