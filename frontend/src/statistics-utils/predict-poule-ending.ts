import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'

type ExpectedMatchOutcomeData = {
  pointsA: number
  pointsB: number
  setsA: number
  setsB: number
  winsA: number
  winsB: number
  competitionPointsA: number
  competitionPointsB: number
}

function expectedValues(p: number, predictions: Record<string, number>, puntentelmethode: string): ExpectedMatchOutcomeData {
  const result: ExpectedMatchOutcomeData = {
    pointsA: 0,
    pointsB: 0,
    setsA: 0,
    setsB: 0,
    winsA: 0,
    winsB: 0,
    competitionPointsA: 0,
    competitionPointsB: 0,
  }
  const method = PUNTENTELMETHODES.find(p => p['@id'] === puntentelmethode)!

  for (const [outcome, prob] of Object.entries(predictions)) {
    const probNormalized = prob / 100
    const [setsA, setsB] = outcome.split('-').map(s => parseInt(s, 10))
    result.setsA += setsA * probNormalized * (method.heeftVerdubbeldeWeergave ? 2 : 1)
    result.setsB += setsB * probNormalized * (method.heeftVerdubbeldeWeergave ? 2 : 1)
    if (setsA > setsB) {
      result.winsA += probNormalized
    }
    else if (setsB > setsA) {
      result.winsB += probNormalized
    }

    const resultPoints = method.mogelijkeUitslagen.find(u => u.setsA === setsA && u.setsB === setsB)!
    result.competitionPointsA += resultPoints.puntenA * probNormalized
    result.competitionPointsB += resultPoints.puntenB * probNormalized
    const decidingSetWasNeeded = Math.abs(setsA - setsB) === 1
    const normalSetCount = setsA + setsB - (decidingSetWasNeeded ? 1 : 0)
    const decidingSetCount = decidingSetWasNeeded ? 1 : 0
    const pointsPerNormalSet = method.minimumPuntenReguliereSet || 25
    const pointsPerDecidingSet = method.minimumPuntenBeslissendeSet || 15

    const [expectedPointsANormalSet, expectedPointsBNormalSet] = expectedSetScore(p, pointsPerNormalSet, method.minimumVerschilReguliereSet)
    const [expectedPointsADecidingSet, expectedPointsBDecidingSet] = expectedSetScore(p, pointsPerDecidingSet, method.minimumVerschilBeslissendeSet)
    result.pointsA += normalSetCount * expectedPointsANormalSet * probNormalized + decidingSetCount * expectedPointsADecidingSet * probNormalized
    result.pointsB += normalSetCount * expectedPointsBNormalSet * probNormalized + decidingSetCount * expectedPointsBDecidingSet * probNormalized
  }

  return result
}

function expectedSetScore(p: number, N = 25, requiredPointDifference = 2) {
  const q = 1 - p

  // binomial coefficient nCk
  const choose = (n: number, k: number) => {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    k = Math.min(k, n - k)
    let c = 1
    for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1)
    return c
  }

  // probability each team wins before reaching N points
  const probAWin = Array(N - 1)
    .fill(0)
    .map((_, k) => choose(N - 1 + k, k) * p ** N * q ** k)
  const probBWin = Array(N - 1)
    .fill(0)
    .map((_, k) => choose(N - 1 + k, k) * q ** N * p ** k)

  let expA = 0
  let expB = 0

  for (let k = 0; k <= N - 2; k++) {
    expA += N * probAWin[k] + k * probBWin[k]
    expB += N * probBWin[k] + k * probAWin[k]
  }

  // If no extra margin required (e.g. difference = 0 or 1), stop here
  if (requiredPointDifference <= 1) return [expA, expB]

  // For volleyball-style "win by D" rule (usually D = 2)
  // Handle deuce case at (N-1, N-1)
  const probDeuce = choose(2 * N - 2, N - 1) * p ** (N - 1) * q ** (N - 1)

  // Expected extra points after deuce until someone leads by requiredPointDifference
  // This generalizes the E = 2p/(p²+q²) formula
  // In general, the chance that A eventually wins by D is p^D / (p^D + q^D)
  const probAWinDeuce = p ** requiredPointDifference / (p ** requiredPointDifference + q ** requiredPointDifference)
  const probBWinDeuce = 1 - probAWinDeuce

  // Expected total extra rallies after deuce:
  const expectedExtraRallies = requiredPointDifference / (p ** requiredPointDifference + q ** requiredPointDifference)

  // Expected split of those rallies into A/B points (proportional to win probs)
  const extraA = expectedExtraRallies * probAWinDeuce
  const extraB = expectedExtraRallies * probBWinDeuce

  expA += probDeuce * ((N - 1) + extraA)
  expB += probDeuce * ((N - 1) + extraB)

  return [expA, expB]
}

export function predictPouleEnding(poule: DetailedPouleInfo): Team[] {
  if (!poule.bt.canPredictAllMatches()) {
    return []
  }
  let results = poule.teams.slice()
  results = results.map(t => ({ ...t })) // deep copy to avoid mutating original data

  const matches = poule.matches.filter(m => !m.eindstand)
  for (const match of matches) {
    const teamA = results.find(t => t.omschrijving === match.teams[0].omschrijving)!
    const teamB = results.find(t => t.omschrijving === match.teams[1].omschrijving)!
    const bt = poule.bt
    const p = bt.pointProb(teamA.omschrijving, teamB.omschrijving)
    const matchPredictions = match.prediction!
    const eValues = expectedValues(p, matchPredictions, poule.puntentelmethode)
    teamA.gespeeld += 1
    teamB.gespeeld += 1
    teamA.puntenVoor += eValues.pointsA
    teamA.puntenTegen += eValues.pointsB
    teamA.setsVoor += eValues.setsA
    teamA.setsTegen += eValues.setsB
    teamA.wedstrijdenWinst += eValues.winsA
    teamA.wedstrijdenVerlies += eValues.winsB
    teamA.punten += eValues.competitionPointsA
    teamB.puntenVoor += eValues.pointsB
    teamB.puntenTegen += eValues.pointsA
    teamB.setsVoor += eValues.setsB
    teamB.setsTegen += eValues.setsA
    teamB.wedstrijdenWinst += eValues.winsB
    teamB.wedstrijdenVerlies += eValues.winsA
    teamB.punten += eValues.competitionPointsB
  }

  results.sort((a, b) => {
    return b.punten - a.punten
  })

  for (let i = 0; i < results.length; i++) {
    results[i].positie = i + 1
  }

  return results
}
