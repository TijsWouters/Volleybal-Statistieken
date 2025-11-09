import { sortByDateAndTime } from '@/utils/sorting'
import dayjs from 'dayjs'
import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'

export function getDataOverTime(poule: DetailedPouleInfo): {
  timePoints: number[]
  dataAtTimePoints: Record<string, DataAtTimePoint>[]
} {
  const timePoints: number[] = []
  const dataAtTimePoints: Record<string, DataAtTimePoint>[] = []

  const sortedMatches = poule.matches.slice().sort(sortByDateAndTime)

  const startTimePoint = dayjs(sortedMatches[0].datum).startOf('day')
  console.log(sortedMatches[0].datum, startTimePoint.valueOf())
  timePoints.push(startTimePoint.valueOf())
  const initialDataPoint: Record<string, DataAtTimePoint> = {}
  for (const team of poule.teams) {
    initialDataPoint[team.team] = { points: 0 }
  }
  dataAtTimePoints.push(initialDataPoint)

  for (let t = 1; t < sortedMatches.length + 1; t++) {
    if (dayjs().isBefore(dayjs(sortedMatches[t - 1].datum))) {
      break
    }
    const match = sortedMatches[t - 1]
    const datePart = dayjs(match.datum).format('YYYY-MM-DD')
    const timePart = dayjs(match.tijdstip).format('HH:mm:ss')
    const combined = `${datePart}T${timePart}`
    const nextTimePoint = dayjs(combined).valueOf()

    const dataToBeAdded: Record<string, DataAtTimePoint> = {}
    for (const team of poule.teams) {
      dataToBeAdded[team.team] = {
        points: getPointsFromMatchResult(match, team.team, poule.puntentelmethode),
      }
    }

    // Two matches at the exact same time, add to previous time point instead of creating a new one
    if (nextTimePoint === timePoints[timePoints.length - 1]) {
      const lastDataPoint = dataAtTimePoints[dataAtTimePoints.length - 1]
      for (const team of poule.teams) {
        lastDataPoint[team.team].points += dataToBeAdded[team.team].points
      }
    }
    else {
      timePoints.push(nextTimePoint)
      const lastDataPoint = dataAtTimePoints[dataAtTimePoints.length - 1]
      for (const team of poule.teams) {
        dataToBeAdded[team.team].points += lastDataPoint[team.team].points
      }
      dataAtTimePoints.push(dataToBeAdded)
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
  for (const possibleResult of puntentelmethode!.mogelijkeUitslagen) {
    if (resultsAreEqual([possibleResult.setsA, possibleResult.setsB], [match.eindstand![0], match.eindstand![1]])) {
      return possibleResult['punten' + teamIndex as 'puntenA' | 'puntenB'] as number
    }
  }
  return 0
}

function resultsAreEqual(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1]
}
