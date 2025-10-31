const API = import.meta.env.VITE_API_URL || ''

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { makeBT } from '@/statistics-utils/bradley-terry'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import TEAM_TYPES from '@/assets/teamTypes.json'
import { useRecent } from '@/hooks/useRecent'
import { useFavourites } from '@/hooks/useFavourites'

export interface Data {
  club: Club
  poules: Poule[]
  fullTeamName: string
  bt: { [pouleName: string]: BTModel }
  clubId: string
  teamType: string
  teamId: string
}

export const useTeamData = (clubId: string, teamType: string, teamId: string): UseQueryResult<Data> => {
  const { addTeamToRecent } = useRecent()
  const { setSeenMatchesForTeam } = useFavourites()

  const query = useQuery<Data>({
    queryKey: [clubId, teamType, teamId],
    retry: false,
    queryFn: async () => {
      let response: Response
      try {
        response = await fetch(`${API}/team/${clubId}/${teamType}/${teamId}`)
      }
      catch {
        throw new Error('Het is niet gelukt om de gegevens voor dit team op te halen')
      }
      if (!response.ok) throw new Error('Het is niet gelukt om de gegevens voor dit team op te halen')
      const data = await response.json() as ApiResponse

      const fullTeamName = data.poules.length ? data.poules[0].omschrijving : `${data.club.naam} ${mapTeamType(teamType)} ${teamId}`

      const bt: { [pouleName: string]: BTModel } = {}
      for (const poule of data.poules) {
        bt[poule.poule] = makeBT(poule, poule.omschrijving)
      }

      for (const poule of data.poules) {
        for (const match of poule.matches) {
          if (match.status.waarde === 'gepland') {
            match.prediction = bt[poule.poule].matchBreakdown(
              match.teams[0].omschrijving,
              match.teams[1].omschrijving,
              poule.puntentelmethode,
            )
          }
        }
      }
      if (import.meta.env.DEV) {
        console.log(data)
      }
      const matches = data.poules.flatMap(p => p.matches)
        .filter(m => m.status.waarde.toLowerCase() === 'gespeeld')
        .filter(m => m.teams.some(t => t.team.includes(`${clubId}/${teamType}/${teamId}`)))
        .map(m => m.uuid)
      setSeenMatchesForTeam(`/${clubId}/${teamType}/${teamId}`, matches)
      return { ...data, fullTeamName, bt, clubId, teamType, teamId }
    },
  })

  if (query.data) {
    addTeamToRecent(query.data.fullTeamName, `/${clubId}/${teamType}/${teamId}`)
  }

  return query
}

export const useClubData = (clubId: string): UseQueryResult<ClubWithTeams> => {
  const { addClubToRecent } = useRecent()

  const query = useQuery<ClubWithTeams>({
    queryKey: [clubId],
    retry: false,
    queryFn: async () => {
      let response: Response
      try {
        response = await fetch(`${API}/club/${clubId}`)
      }
      catch {
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

  if (query.data) {
    addClubToRecent(query.data)
  }

  return query
}

export const useMatchData = (clubId: string, teamType: string, teamId: string, matchUuid: string) => {
  const { data: teamData, isLoading: teamLoading, error: teamError } = useTeamData(clubId, teamType, teamId)

  const match = teamData ? teamData.poules.flatMap(p => p.matches).find(m => m.uuid === matchUuid) : undefined

  const {
    data,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery<DetailedMatchInfo>({
    queryKey: [clubId, teamType, teamId, matchUuid],
    retry: false,
    enabled: !!teamData,
    queryFn: async () => {
      if (!match) {
        throw new Error('Wedstrijd niet gevonden')
      }
      const locationResponse = await fetch(`${API}/location?id=${match?.sporthal}`)
      if (!locationResponse.ok) throw new Error('Het is niet gelukt om de gegevens voor de locatie op te halen')
      const location = await locationResponse.json() as Location
      const detailedMatchInfo = match as DetailedMatchInfo
      detailedMatchInfo.location = location
      detailedMatchInfo.previousEncounters = []
      detailedMatchInfo.fullTeamName = teamData!.fullTeamName

      const btModel = teamData!.bt[match.poule]
      const teamIndex = match.teams.map(t => t.omschrijving).indexOf(teamData!.fullTeamName)
      const opponentIndex = teamIndex === 0 ? 1 : 0
      detailedMatchInfo.strengthDifference = btModel.strengths[`${match.teams[opponentIndex].omschrijving}`]

      const poule = teamData!.poules.find(p => p.poule === match.poule)
      const matchesWithoutCurrent = poule!.matches.filter(m => m.uuid !== match.uuid)
      const btModelWithoutCurrent = makeBT({ ...poule!, matches: matchesWithoutCurrent }, poule!.omschrijving)
      detailedMatchInfo.strengthDifferenceWithoutCurrent = btModelWithoutCurrent.strengths[`${match.teams[opponentIndex].omschrijving}`]

      detailedMatchInfo.previousEncounters = teamData!.poules.flatMap(p => p.matches)
        .filter(m => m.status.waarde.toLowerCase() === 'gespeeld')
        .filter(m => m.teams.some(t => t.omschrijving === match.teams[teamIndex].omschrijving))
        .filter(m => m.teams.some(t => t.omschrijving === match.teams[opponentIndex].omschrijving))
        .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())

      if (import.meta.env.DEV) console.log(detailedMatchInfo)
      return detailedMatchInfo
    },
  })

  if (locationError) {
    throw locationError
  }

  return {
    data,
    isLoading: teamLoading || (match?.sporthal ? locationLoading : false),
    error: teamError ?? locationError ?? locationError ?? null,
  }
}

function mapTeamType(omschrijving: string): string {
  for (const teamType of TEAM_TYPES) {
    if (teamType.omschrijving.toLowerCase() === omschrijving.toLowerCase()) {
      return teamType.afkorting
    }
  }
  return ''
}
