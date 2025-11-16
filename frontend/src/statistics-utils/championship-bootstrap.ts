import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'

const N_BOOTSTRAP_SAMPLES = 300000

export function getOutcomeProbabilities(teams: Team[], matches: Match[], puntentelmethodeId: string, progressUpdate: (progress: number) => void): Record<string, number[]> {
  const method = PUNTENTELMETHODES.find(p => p['@id'] === puntentelmethodeId)! as Puntentelmethode
  const futureMatches = matches.filter(m => !m.eindstand)
  const outcomeCounts: Record<string, number[]> = {}
  const startingPointTable: Record<string, number> = {}
  for (const team of teams) {
    outcomeCounts[team.omschrijving] = Array(teams.length).fill(0)
    startingPointTable[team.omschrijving] = team.punten
  }
  for (let i = 0; i < N_BOOTSTRAP_SAMPLES; i++) {
    const simulatedPointsTable = simulateChampionshipBootstrap(teams, futureMatches, method)
    const sortedTeams = Object.entries(simulatedPointsTable)
      .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
      .map(([teamName]) => teams.find(t => t.omschrijving === teamName)!)
    for (let position = 0; position < sortedTeams.length; position++) {
      const team = sortedTeams[position]
      outcomeCounts[team.omschrijving][position] += 1
    }
    if (i % 1000 === 0) {
      progressUpdate(i / N_BOOTSTRAP_SAMPLES)
    }
  }
  const outcomeProbabilities: Record<string, number[]> = {}
  for (const [teamName, counts] of Object.entries(outcomeCounts)) {
    outcomeProbabilities[teamName] = counts.map(count => count / N_BOOTSTRAP_SAMPLES)
  }
  return outcomeProbabilities
}

function simulateChampionshipBootstrap(teams: Team[], matches: Match[], method: Puntentelmethode): Record<string, number> {
  const pointsTable: Record<string, number> = {}
  for (const team of teams) {
    pointsTable[team.omschrijving] = team.punten
  }

  for (const match of matches) {
    const [setsA, setsB] = randomMatchResult(match.prediction!)
    const methodOutcome = method.mogelijkeUitslagen.find(mo => mo.setsA === setsA && mo.setsB === setsB)!
    pointsTable[match.teams[0].omschrijving] += methodOutcome.puntenA
    pointsTable[match.teams[1].omschrijving] += methodOutcome.puntenB
  }
  return pointsTable
}

function randomMatchResult(prediction: Record<string, number>): [number, number] {
  const r = Math.random()
  let cumulative = 0
  for (const [result, prob] of Object.entries(prediction)) {
    const probability = prob / 100
    cumulative += probability
    if (r <= cumulative) {
      return result.split('-').map(Number) as [number, number]
    }
  }
  console.error('Invalid prediction probabilities:', prediction)
  throw new Error('Invalid prediction probabilities:' + cumulative)
}
