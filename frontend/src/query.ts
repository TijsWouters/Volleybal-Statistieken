const API = import.meta.env.VITE_API_URL || ''

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { calculateStrengthDifference, makeBT } from '@/statistics-utils/bradley-terry'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import TEAM_TYPES from '@/assets/teamTypes.json'
import { useRecent } from '@/hooks/useRecent'
import { sortByDateAndTime } from './utils/sorting'
import { useLocation, useParams, useSearchParams } from 'react-router'
import { getDataOverTime } from './statistics-utils/data-over-time'
import { useMemo } from 'react'
import { predictPouleEnding } from './statistics-utils/predict-poule-ending'
import { computeConsistencyScores } from './statistics-utils/consistency-scores'
import { useMatchNotifications } from './hooks/useMatchNotifications'

export interface Data {
  club: Club
  poules: Poule[]
  fullTeamName: string
  bt: { [pouleName: string]: BTModel }
  clubId: string
  teamType: string
  teamId: string
}

export const useTeamData = (): UseQueryResult<Data | null> => {
  const location = useLocation()
  const { addTeamToRecent } = useRecent()
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>()!

  const query = useQuery<Data | null>({
    queryKey: [clubId || 'x', teamType || 'x', teamId || 'x'],
    retry: false,
    enabled: location.pathname.startsWith('/team/'),
    queryFn: async () => {
      if (!clubId || !teamType || !teamId) {
        return null
      }
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
          if (match.status.waarde !== 'gespeeld') {
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

      return { ...data, fullTeamName, bt, clubId, teamType, teamId }
    },
  })

  if (query.data) {
    addTeamToRecent(query.data.fullTeamName, `/${clubId}/${teamType}/${teamId}`)
  }

  return query
}

export const useClubData = (): UseQueryResult<ClubWithTeams> => {
  const location = useLocation()
  const { addClubToRecent } = useRecent()
  const { clubId } = useParams<{ clubId: string }>()!

  const query = useQuery<ClubWithTeams>({
    queryKey: [clubId || 'x'],
    retry: false,
    enabled: location.pathname.startsWith('/club/'),
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

export const useMatchData = () => {
  const { data: teamData } = useTeamData()
  const { matchUuid } = useParams<{ matchUuid: string }>()!
  const match = teamData ? teamData.poules.flatMap(p => p.matches).find(m => m.uuid === matchUuid) : undefined
  const { deleteNotification } = useMatchNotifications(false)

  const data = useMemo<DetailedMatchInfo | null>(() => {
    if (!match) {
      return null
    }
    const detailedMatchInfo = { ...match } as DetailedMatchInfo
    detailedMatchInfo.otherEncounters = []
    detailedMatchInfo.fullTeamName = teamData!.fullTeamName

    const btModel = teamData!.bt[match.poule]
    let teamIndex = match.teams.map(t => t.omschrijving).indexOf(teamData!.fullTeamName)
    if (teamIndex === -1) {
      detailedMatchInfo.neutral = true
      teamIndex = 0
    }

    const opponentIndex = teamIndex === 0 ? 1 : 0
    if (detailedMatchInfo.neutral) {
      detailedMatchInfo.strengthDifference = btModel.strengths[`${match.teams[teamIndex].omschrijving}`] - btModel.strengths[`${match.teams[opponentIndex].omschrijving}`]
    }
    else {
      detailedMatchInfo.strengthDifference = -btModel.strengths[`${match.teams[opponentIndex].omschrijving}`]
    }

    const poule = teamData!.poules.find(p => p.poule === match.poule)
    const matchesWithoutCurrent = poule!.matches.filter(m => m.uuid !== match.uuid)
    const btModelWithoutCurrent = makeBT({ ...poule!, matches: matchesWithoutCurrent }, poule!.omschrijving)
    if (detailedMatchInfo.neutral) {
      detailedMatchInfo.strengthDifferenceWithoutCurrent = btModelWithoutCurrent.strengths[`${match.teams[teamIndex].omschrijving}`] - btModelWithoutCurrent.strengths[`${match.teams[opponentIndex].omschrijving}`]
    }
    else {
      detailedMatchInfo.strengthDifferenceWithoutCurrent = -btModelWithoutCurrent.strengths[`${match.teams[opponentIndex].omschrijving}`]
    }
    detailedMatchInfo.otherEncounters = teamData!.poules.flatMap(p => p.matches)
      .filter(m => m.teams.some(t => t.omschrijving === match.teams[teamIndex].omschrijving))
      .filter(m => m.teams.some(t => t.omschrijving === match.teams[opponentIndex].omschrijving))
      .filter(m => m.uuid !== match.uuid && (m.status.waarde.toLowerCase() === 'gespeeld' || m.status.waarde.toLowerCase() === 'gepland'))
      .sort(sortByDateAndTime)

    detailedMatchInfo.puntentelmethode = poule!.puntentelmethode

    if (teamData?.poules.find(p => p.poule === match.poule)?.standberekening) {
      detailedMatchInfo.pouleLink = `/team/${teamData!.clubId}/${teamData!.teamType}/${teamData!.teamId}/poule?pouleId=${match.poule}`
    }
    deleteNotification(`/${teamData!.clubId}/${teamData!.teamType}/${teamData!.teamId}`, match.uuid)

    if (import.meta.env.DEV) console.log(detailedMatchInfo)
    return detailedMatchInfo
  }, [match, teamData])

  return data
}

export const useRouteData = () => {
  const location = useLocation()
  const match = useMatchData()
  const locationId = match?.sporthal
  const fromClubId = match?.teams[1]?.team.split('/')[3] // Assume first team is home team

  return useQuery<RouteResponse>({
    queryKey: ['route', fromClubId, locationId],
    enabled: !!locationId && !!fromClubId && !!match && location.pathname.includes('/match/'),
    queryFn: async () => {
      const routeResponse = await fetch(`${API}/route?fromClubId=${fromClubId}&id=${locationId}`)
      if (!routeResponse.ok) throw new Error('Het is niet gelukt om de gegevens voor de locatie op te halen')
      const routeData = await routeResponse.json() as RouteResponse
      return routeData
    },
  })
}

export const usePouleData = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const pouleId = searchParams.get('pouleId') || ''
  const { data: teamData } = useTeamData()

  const data = useMemo<DetailedPouleInfo | undefined>(() => {
    if (!teamData || !pouleId || !location.pathname.includes('/poule')) return undefined
    const poule = teamData!.poules.find(p => p.poule === pouleId) as DetailedPouleInfo
    poule['bt'] = teamData!.bt[pouleId]
    poule.fullTeamName = teamData!.fullTeamName

    for (const team of poule.teams) {
      team.matchWinRate = team.wedstrijdenWinst / ((team.wedstrijdenWinst + team.wedstrijdenVerlies) || 1)
      team.setWinRate = team.setsVoor / ((team.setsVoor + team.setsTegen) || 1)
      team.pointWinRate = team.puntenVoor / ((team.puntenVoor + team.puntenTegen) || 1)
    }

    poule.clubId = teamData!.clubId
    poule.teamType = teamData!.teamType
    poule.teamId = teamData!.teamId
    poule.teams.sort((a, b) => a.positie - b.positie)

    poule.showData = poule.matches.some(m => m.eindstand)

    const { timePoints, dataAtTimePoints } = getDataOverTime(poule)
    poule.timePoints = timePoints
    poule.dataAtTimePoints = dataAtTimePoints

    const mostSurprisingResuls = []
    for (const match of poule.matches) {
      if (match.status.waarde.toLowerCase() !== 'gespeeld' || !match.setstanden) continue
      const btWithoutMatch = makeBT({ ...poule, matches: poule.matches.filter(m => m.uuid !== match.uuid) }, poule.omschrijving)
      const expectedStrengthDifference = btWithoutMatch.strengths[match.teams[0].omschrijving] - btWithoutMatch.strengths[match.teams[1].omschrijving];
      (match as DetailedMatchInfo).strengthDifferenceWithoutCurrent = expectedStrengthDifference
      const matchTotalPoints = match.setstanden!.reduce((sum, set) => sum + set.puntenA + set.puntenB, 0)
      const matchScoredPoints = match.setstanden!.reduce((sum, set) => sum + set.puntenA, 0)
      const resultingPointChance = matchScoredPoints / matchTotalPoints
      const actualStrengthDifference = calculateStrengthDifference(resultingPointChance)
      const surprise = Math.abs(actualStrengthDifference - expectedStrengthDifference)
      mostSurprisingResuls.push({ match, surprise, expectedStrengthDifference, actualStrengthDifference })
    }

    poule.consistencyScores = computeConsistencyScores(poule)

    mostSurprisingResuls.sort((a, b) => b.surprise - a.surprise)
    poule.mostSurprisingResults = mostSurprisingResuls.slice(0, 3).map(r => r.match)
    poule.predictedEndResults = predictPouleEnding(poule)

    if (import.meta.env.DEV) {
      console.log(poule)
    }

    return poule
  }, [teamData, pouleId])

  return { data }
}

function mapTeamType(omschrijving: string): string {
  for (const teamType of TEAM_TYPES) {
    if (teamType.omschrijving.toLowerCase() === omschrijving.toLowerCase()) {
      return teamType.afkorting
    }
  }
  return ''
}
