import { sortByDateAndTime } from '@/utils/sorting'
import dayjs from 'dayjs'
import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'
import { makeBT } from './bradley-terry'

export function getDataOverTime(poule: DetailedPouleInfo): {
  timePoints: number[]
  dataAtTimePoints: Record<string, DataAtTimePoint>[]
} {
  const timePoints: number[] = []
  const dataAtTimePoints: Record<string, DataAtTimePoint>[] = []

  const sortedMatches = poule.matches.slice().sort(sortByDateAndTime)

  const detailedTimePoints = dayjs(sortedMatches[sortedMatches.length - 1].datum).valueOf() - dayjs(sortedMatches[0].datum).valueOf() > dayjs(0).add(3, 'day').valueOf() ? false : true

  const dayPartFirstMatch = dayjs(sortedMatches[0].datum).format('YYYY-MM-DD')
  const timePartFirstMatch = detailedTimePoints ? dayjs(sortedMatches[0].tijdstip).format('HH:mm') : '00:00'
  const firstMatchDateTimeString = detailedTimePoints ? `${dayPartFirstMatch}T${timePartFirstMatch}` : `${dayPartFirstMatch}`

  const startTimePoint = dayjs(firstMatchDateTimeString).subtract(1, detailedTimePoints ? 'hour' : 'day')
  timePoints.push(startTimePoint.valueOf())
  const initialDataPoint: Record<string, DataAtTimePoint> = {}
  for (const team of poule.teams) {
    initialDataPoint[team.team] = { points: 0, position: null, strength: 0 }
  }
  dataAtTimePoints.push(initialDataPoint)

  for (let t = 1; t < sortedMatches.length + 1; t++) {
    if (dayjs().isBefore(dayjs(sortedMatches[t - 1].datum))) {
      break
    }
    const match = sortedMatches[t - 1]
    const datePart = dayjs(match.datum).format('YYYY-MM-DD')
    const timePart = detailedTimePoints ? dayjs(match.tijdstip).format('HH:mm') : '00:00'
    const dateTimeString = detailedTimePoints ? `${datePart}T${timePart}` : `${datePart}`
    const nextTimePoint = dayjs(dateTimeString).valueOf()

    const pouleWithPartialMatches = { ...poule, matches: sortedMatches.slice(0, t) }
    const bt = makeBT(pouleWithPartialMatches, poule.fullTeamName, true)

    const dataToBeAdded: Record<string, Partial<DataAtTimePoint>> = {}
    for (const team of poule.teams) {
      dataToBeAdded[team.team] = {
        points: getPointsFromMatchResult(match, team.team, poule.puntentelmethode),
      }
    }

    // Two matches at the exact same time, add to previous time point instead of creating a new one
    if (nextTimePoint === timePoints[timePoints.length - 1] && !detailedTimePoints) {
      const lastDataPoint = dataAtTimePoints[dataAtTimePoints.length - 1]
      for (const team of poule.teams) {
        lastDataPoint[team.team].points += dataToBeAdded[team.team].points!
      }
      const teamSortedOnPoints = poule.teams.slice().sort((a, b) => {
        const pointsA = lastDataPoint[a.team].points
        const pointsB = lastDataPoint[b.team].points
        return pointsB - pointsA
      })
      for (let i = 0; i < teamSortedOnPoints.length; i++) {
        const team = teamSortedOnPoints[i]
        lastDataPoint[team.team].position = i + 1
        lastDataPoint[team.team].strength = bt.strengths[team.omschrijving] * 100 || 0
      }
    }
    else {
      timePoints.push(nextTimePoint)
      const lastDataPoint = dataAtTimePoints[dataAtTimePoints.length - 1]
      for (const team of poule.teams) {
        dataToBeAdded[team.team].points! += lastDataPoint[team.team].points
      }
      const teamSortedOnPoints = poule.teams.slice().sort((a, b) => {
        const pointsA = dataToBeAdded[a.team].points!
        const pointsB = dataToBeAdded[b.team].points!
        return pointsB - pointsA
      })
      for (let i = 0; i < teamSortedOnPoints.length; i++) {
        const team = teamSortedOnPoints[i]
        dataToBeAdded[team.team].position = i + 1
        dataToBeAdded[team.team].strength = bt.strengths[team.omschrijving] * 100 || 0
      }
      dataAtTimePoints.push(dataToBeAdded as Record<string, DataAtTimePoint>)
    }
  }

  return {
    timePoints,
    dataAtTimePoints,
  }
}

function getPointsFromMatchResult(match: Match, teamId: string, puntentelmethodeId: string): number {
  if (!match.eindstand) {
    return 0
  }
  let teamIndex: 'A' | 'B'
  if (match.teams[0].team === teamId) {
    teamIndex = 'A'
  }
  else if (match.teams[1].team === teamId) {
    teamIndex = 'B'
  }
  else {
    return 0
  }
  const puntentelmethode = PUNTENTELMETHODES.find(m => m['@id'] === puntentelmethodeId)
  if (!puntentelmethode) return 0
  for (const possibleResult of puntentelmethode!.mogelijkeUitslagen) {
    if (resultsAreEqual([possibleResult.setsA, possibleResult.setsB], [match.eindstand![0], match.eindstand![1]], puntentelmethode.heeftVerdubbeldeWeergave)) {
      return possibleResult['punten' + teamIndex as 'puntenA' | 'puntenB'] as number
    }
  }
  return 0
}

function resultsAreEqual(a: [number, number], b: [number, number], heeftVerdubbeldeWeergave: boolean): boolean {
  if (heeftVerdubbeldeWeergave) {
    return 2 * a[0] === b[0] && 2 * a[1] === b[1]
  }
  return a[0] === b[0] && a[1] === b[1]
}
