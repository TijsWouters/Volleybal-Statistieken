import { useState, useEffect } from 'react'

import SearchResultsList from './SearchResultsList'
import type { SearchResult } from './Search'

export default function Random() {
  const [teams, setTeams] = useState<TeamForClub[]>([])

  useEffect(() => {
    async function fetchRandomTeams() {
      const response = await fetch('/api/random-teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
      }
      else {
        throw new Error('Het is niet gelukt om willekeurige teams op te halen: ' + response.statusText)
      }
    }

    fetchRandomTeams()
  }, [])

  return (
    <div className="flex flex-col w-full">
      <SearchResultsList results={teams.map(mapToSearchResult)} error={null} loading={teams.length === 0} placeHolder={<></>} />
    </div>
  )
}

function mapToSearchResult(team: TeamForClub): SearchResult {
  return {
    type: 'team',
    title: team.naam,
    url: getTeamUrl(team),
  }
}

function getTeamUrl(team: TeamForClub): string {
  const parts = team['@id'].split('/').filter(Boolean).slice(-3)
  return `/${parts.join('/')}`
}
