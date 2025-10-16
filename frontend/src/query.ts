const API = import.meta.env.VITE_API_URL || ''

import { useQuery } from '@tanstack/react-query'

import { makeBT } from './hooks/useBT'

import type { BTModel } from './hooks/useBT'

export interface Data {
  club: Club
  poules: Poule[],
  fullTeamName: string,
  bt: { [pouleName: string]: BTModel },
  clubId: string,
  teamType: string,
  teamId: string,
}

export const useTeamData = (clubId: string, teamType: string, teamId: string) => {
  return useQuery<Data>({
    queryKey: [clubId, teamType, teamId],
    retry: false,
    queryFn: async () => {
      let response: Response
      try {
        response = await fetch(`${API}/team/${clubId}/${teamType}/${teamId}`)
      } catch {
        throw new Error('Het is niet gelukt om de gegevens voor dit team op te halen')
      }
      if (!response.ok) throw new Error('Het is niet gelukt om de gegevens voor dit team op te halen')
      const data = await response.json() as ApiResponse

      const fullTeamName = data.poules.length ? data.poules[0].omschrijving : `${data.club.naam} ${mapTeamType(teamType)} ${teamId}`

      const bt: { [pouleName: string]: BTModel } = {}
      for (const poule of data.poules) {
        bt[poule.name] = makeBT(poule, poule.omschrijving)
      }
      
      for (const poule of data.poules) {
        for (const match of poule.matches) {
          if (match.status.waarde === 'gepland') {
            match.prediction = bt[poule.name].matchBreakdown(
              match.teams[0].omschrijving,
              match.teams[1].omschrijving,
              poule.puntentelmethode
            )
          }
        }
      }
      return { ...data, fullTeamName, bt, clubId, teamType, teamId }
    },
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
