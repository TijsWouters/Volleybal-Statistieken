import { calculateStrengthDifference } from './bradley-terry'

export function computeConsistencyScores(poule: Poule): Record<string, number> {
  const teamDiffs: Record<string, { diff: number, opponent: string }[]> = {}
  for (const team of poule.teams) {
    teamDiffs[team.omschrijving] = []
  }
  // 1. Gather strength differences per set for each team
  for (const match of poule.matches) {
    const matchWithStrength = match as Match & { strengthDifferenceWithoutCurrent: number }
    if (match.status.waarde.toLowerCase() !== 'gespeeld' || !match.setstanden || !matchWithStrength.strengthDifferenceWithoutCurrent) continue
    for (const set of match.setstanden) {
      const totalPoints = set.puntenA + set.puntenB
      if (totalPoints === 0) continue
      const pointChanceA = set.puntenA / totalPoints
      const pointChanceB = set.puntenB / totalPoints
      const strengthA = calculateStrengthDifference(pointChanceA)
      const strengthB = calculateStrengthDifference(pointChanceB)
      teamDiffs[match.teams[0].omschrijving].push({ diff: matchWithStrength.strengthDifferenceWithoutCurrent - strengthA, opponent: match.teams[1].omschrijving })
      teamDiffs[match.teams[1].omschrijving].push({ diff: matchWithStrength.strengthDifferenceWithoutCurrent + strengthB, opponent: match.teams[0].omschrijving })
    }
  }
  // 2. Compute volatilities
  const volatilities = computeVolatilites(teamDiffs)
  // 3. Compute consistency scores
  const consistencyScores: Record<string, number> = {}
  for (const team of poule.teams) {
    const normalizedDiffs = teamDiffs[team.omschrijving].map(d => d.diff / (1 + volatilities[d.opponent]))
    consistencyScores[team.omschrijving] = 1 / (1 + Math.sqrt(unbiasedSampleVariance(normalizedDiffs)))
  }

  return consistencyScores
}

function computeVolatilites(teamDiffs: Record<string, { diff: number, opponent: string }[]>): Record<string, number> {
  const volatilities: Record<string, number> = {}
  for (const [team, diffs] of Object.entries(teamDiffs)) {
    volatilities[team] = Math.sqrt(unbiasedSampleVariance(diffs.map(d => d.diff)))
  }
  return volatilities
}

function unbiasedSampleVariance(data: number[]): number {
  const n = data.length
  if (n < 2) return 0
  const mean = data.reduce((sum, value) => sum + value, 0) / n
  const variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1)
  return variance
}
