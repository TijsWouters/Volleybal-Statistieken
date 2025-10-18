const API = import.meta.env.VITE_API_URL || ''

import { useQuery } from '@tanstack/react-query'
import { makeBT } from '@/statistics-utils/bradley-terry'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import TEAM_TYPES from '@/assets/teamTypes.json'

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
      if (import.meta.env.DEV) {
        console.log(data)
      }
      return { ...data, fullTeamName, bt, clubId, teamType, teamId }
    },
  })
}

export const useClubData = (clubId: string) => {
  return useQuery<ClubWithTeams>({
    queryKey: [clubId],
    retry: false,
    queryFn: async () => {
      let response: Response
      try {
        response = await fetch(`${API}/club/${clubId}`)
      } catch {
        throw new Error('Het is niet gelukt om de gegevens voor deze club op te halen')
      }
      if (!response.ok) throw new Error('Het is niet gelukt om de gegevens voor deze club op te halen')
      const club = await response.json() as ClubWithTeams
      if (import.meta.env.DEV) {
        console.log(club)
      }
      return club
    },
  })
}

function mapTeamType(omschrijving: string): string {
  for (const teamType of TEAM_TYPES) {
    if (teamType.omschrijving.toLowerCase() === omschrijving.toLowerCase()) {
      return teamType.afkorting
    }
  }
  return ''
}
