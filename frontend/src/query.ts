const API = import.meta.env.VITE_API_URL || ''

import { useQuery } from '@tanstack/react-query'

import { makeBT } from './hooks/useBT'

export const useTeamData = (clubId: string, teamType: string, teamId: string) => {
  return useQuery({
    queryKey: [clubId, teamType, teamId],
    queryFn: async () => {
      const response = await fetch(`${API}/team/${clubId}/${teamType}/${teamId}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      data.fullTeamName = `${data.club.naam} ${mapTeamType(teamType)} ${teamId}`

      data.bt = {}
      for (const poule of data.poules) {
        data.bt[poule.name] = makeBT(poule, data.fullTeamName)
      }

      console.log(data)
      return data
    },
    retry: false,
  })
}

function mapTeamType(teamType: string): string {
  switch (teamType) {
    case 'heren': return 'HS'
    case 'dames': return 'DS'
    case 'jongens-c': return 'JC'
    case 'jongens-b': return 'JB'
    case 'jongens-a': return 'JA'
    case 'meiden-c': return 'MC'
    case 'meiden-b': return 'MB'
    case 'meiden-a': return 'MA'
    case 'heren-recreatief': return 'HR'
    case 'dames-recreatief': return 'DR'
    case 'mix-recreatief': return 'XR'
    case 'mix-c': return 'XC'
    case 'mix-b': return 'XB'
    case 'mix-a': return 'XA'
    case 'volley-stars-level-1': return 'L1'
    case 'volley-stars-level-2': return 'L2'
    case 'volley-stars-level-3': return 'L3'
    case 'volley-stars-level-4': return 'L4'
    default: return ''
  }
}
