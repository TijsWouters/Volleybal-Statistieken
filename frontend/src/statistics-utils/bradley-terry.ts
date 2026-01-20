// btPoints.js
// Bradley–Terry on rally points (no home/recency).
// Fits strengths s_i so that logit(p_ij) = s_i - s_j by IRLS (logistic regression with ridge).
import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'

export interface BTModel {
  teams: string[]
  anchorTeam: string
  strengths: Record<string, number>
  pointProb: (homeTeam: string, awayTeam: string) => number
  matchBreakdown: (homeTeam: string, awayTeam: string, method?: string) => Record<string, number> | null
  predictionPossible: (homeTeam: string, awayTeam: string) => boolean
  canPredictAllMatches: () => boolean
}

// ---------- Math utils ----------
export function sigmoid(z: number) {
  // robust-ish logistic
  if (z >= 0) {
    const ez = Math.exp(-z)
    return 1 / (1 + ez)
  }
  else {
    const ez = Math.exp(z)
    return ez / (1 + ez)
  }
}

export function calculateStrengthDifference(pointChance: number) {
  if (pointChance <= 0) pointChance = 1 / 26
  if (pointChance >= 1) pointChance = 1 - 1 / 26
  return Math.log(pointChance / (1 - pointChance))
}

function l2norm(arr: string | any[]) {
  let s = 0
  for (let i = 0; i < arr.length; i++) s += arr[i] * arr[i]
  return Math.sqrt(s)
}

// Binomial coefficient C(n,k) with stable multiplicative form
function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let res = 1
  for (let i = 1; i <= k; i++) {
    res = (res * (n - k + i)) / i
  }
  return res
}

// Cholesky solver for symmetric positive definite systems (A x = b)
function choleskySolve(A: string | any[], b: any[]) {
  const n = A.length
  // copy to avoid mutating caller's A
  const L = Array.from({ length: n }, () => new Array(n).fill(0))

  // Try factorization; if it fails due to round-off, add tiny jitter
  const jitterBase = 1e-10
  let jitter = 0
  for (; ;) {
    let ok = true
    // Build (A + jitter*I) into L as Cholesky
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = A[i][j] + (i === j ? jitter : 0)
        for (let k = 0; k < j; k++) sum -= L[i][k] * L[j][k]
        if (i === j) {
          if (sum <= 0) {
            ok = false
            break
          }
          L[i][j] = Math.sqrt(sum)
        }
        else {
          L[i][j] = sum / L[j][j]
        }
      }
      if (!ok) break
    }
    if (ok) break
    jitter = jitter === 0 ? jitterBase : jitter * 10 // increase jitter if needed
    if (jitter > 1e-2) throw new Error('Cholesky failed: matrix not SPD enough')
  }

  // Solve L y = b
  const y = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let sum = b[i]
    for (let k = 0; k < i; k++) sum -= L[i][k] * y[k]
    y[i] = sum / L[i][i]
  }

  // Solve L^T x = y
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i]
    for (let k = i + 1; k < n; k++) sum -= L[k][i] * x[k]
    x[i] = sum / L[i][i]
  }
  return x
}

// ---------- Volleyball probabilities ----------
function setWinProb(p: number, target = 25) {
  if (p <= 0) return 0
  if (p >= 1) return 1
  const n = target

  // Win before deuce: opponent ends with k in 0..n-2
  let pre = 0
  for (let k = 0; k <= n - 2; k++) {
    pre += comb(n - 1 + k, k) * Math.pow(p, n) * Math.pow(1 - p, k)
  }

  // Reach deuce (n-1,n-1), then win with p^2/(p^2 + (1-p)^2)
  const deuceReach = comb(2 * n - 2, n - 1) * Math.pow(p, n - 1) * Math.pow(1 - p, n - 1)
  const deuceWin = (p * p) / (p * p + (1 - p) * (1 - p))

  return pre + deuceReach * deuceWin
}

type Winner = 'A' | 'B'

function generateChains(n: number): Array<Winner[]> {
  let results: Array<Winner[]> = []

  for (let i = 0; i < n; i++) {
    const newResults: Array<Winner[]> = []
    for (const chain of results) {
      newResults.push([...chain, 'A'])
      newResults.push([...chain, 'B'])
    }
    if (i === 0) newResults.push(['A'], ['B'])
    results = newResults
  }
  return results
}

function matchProbs(p: number, methodId: string, avgSetPoints: number): Record<string, number> {
  const method = PUNTENTELMETHODES.find(m => m['@id'] === methodId)!
  const s = setWinProb(p, method.minimumPuntenReguliereSet > 0 ? method.minimumPuntenReguliereSet : avgSetPoints * p)
  const t = setWinProb(p, method.minimumPuntenBeslissendeSet > 0 ? method.minimumPuntenBeslissendeSet : avgSetPoints * p)
  const out: Record<string, number> = {}

  const possibleResults = method?.mogelijkeUitslagen

  const maxSets = Math.max(...possibleResults.map((r: MogelijkeUitslag) => r.setsA + r.setsB))

  const chains = generateChains(maxSets)

  for (const chain of chains) {
    let setsA = 0
    let setsB = 0
    let prob = 1
    let terminatesAt: string = ''
    for (let i = 0; i < chain.length; i++) {
      const winner = chain[i]
      if (winner === 'A') {
        prob *= (setsA === setsB && setsA + setsB === maxSets - 1) ? t : s
        setsA++
      }
      else {
        prob *= (setsA === setsB && setsA + setsB === maxSets - 1) ? (1 - t) : (1 - s)
        setsB++
      }
      if (terminatesAt !== '') continue
      for (const res of possibleResults) {
        if (setsA === res.setsA && setsB === res.setsB) {
          terminatesAt = method.heeftVerdubbeldeWeergave ? `${2 * setsA}-${2 * setsB}` : `${setsA}-${setsB}`
        }
      }
    }
    if (terminatesAt === '') console.warn('Warning: chain did not terminate in valid result', chain)
    out[terminatesAt] = (out[terminatesAt] ?? 0) + prob
  }

  const formattedOut: Record<string, number> = {}
  for (const [key, value] of Object.entries(out).sort(([keyA], [keyB]) => {
    const [setsA, setsB] = keyA.split('-').map(Number)
    const [setsC, setsD] = keyB.split('-').map(Number)
    return (setsC - setsD) - (setsA - setsB)
  })) {
    formattedOut[key] = (value * 100)
  }

  // out["A_win"] = out["3-0"] + out["3-1"] + out["3-2"];
  return formattedOut
}

// ---------- Core BT fit (no home/recency) ----------
function fitBTPoints(
  teams: string[],
  matches: { homeTeam: string, awayTeam: string, homePoints: number, awayPoints: number, weight: number }[],
  opts: { ridge?: number, maxIter?: number, tol?: number, anchorTeam?: string } = {},
  avgSetPoints = 25,
): BTModel {
  const ridge = opts.ridge ?? 0.1
  const maxIter = opts.maxIter ?? 100
  const tol = opts.tol ?? 1e-8

  teams.slice().sort()

  // Anchor: fix one team to 0 to identify the model
  const anchorTeam = opts.anchorTeam ?? teams[teams.length - 1]
  if (!teams.includes(anchorTeam)) throw new Error('anchorTeam not present in matches')

  const t2idx = new Map(teams.map((t, i) => [t, i]))
  const anchorIdx = t2idx.get(anchorTeam)
  const free = teams.map((_, i) => i).filter(i => i !== anchorIdx)
  const pos = new Map(free.map((k, i) => [k, i])) // team index -> column index

  // Convenience accessors per row
  const rows = matches.map((r: { homeTeam: string, awayTeam: string, homePoints: any, awayPoints: any, weight: number }) => {
    const i = t2idx.get(r.homeTeam)
    const j = t2idx.get(r.awayTeam)
    const y = r.homePoints
    const n = r.homePoints + r.awayPoints
    return { i, j, y, n, weight: r.weight }
  })

  // Parameters: beta (free team strengths; anchor is implicit 0)
  let beta = new Array(free.length).fill(0) // initial β = 0 (all equal)

  // IRLS iterations
  for (let it = 0; it < maxIter; it++) {
    // Build gradient g and Hessian H = X^T W X (implicitly), plus ridge
    const pDim = beta.length
    const g = new Array(pDim).fill(0)
    const H = Array.from({ length: pDim }, () => new Array(pDim).fill(0))
    let maxEta = -Infinity // only used for sanity/debug

    for (const r of rows) {
      // eta = s_i - s_j, where s_k = beta[pos[k]] if k != anchor else 0
      const iiFree = r.i !== anchorIdx ? pos.get(r.i!) : null
      const jjFree = r.j !== anchorIdx ? pos.get(r.j!) : null

      let eta = 0
      if (iiFree !== null) eta += beta[iiFree!]
      if (jjFree !== null) eta -= beta[jjFree!]

      const mu = sigmoid(eta)
      const resid = r.y - r.n * mu // y - n*μ
      const w = r.n * mu * (1 - mu) // n*μ*(1-μ)
      if (w === 0) continue // no info

      // Gradient contributions: +resid for i, -resid for j
      if (iiFree !== null) g[iiFree!] += resid * r.weight
      if (jjFree !== null) g[jjFree!] -= resid * r.weight

      // Hessian contributions (rank-1 on [ +1 at i, -1 at j ])
      if (iiFree !== null && jjFree !== null) {
        H[iiFree!][iiFree!] += w
        H[jjFree!][jjFree!] += w
        H[iiFree!][jjFree!] -= w
        H[jjFree!][iiFree!] -= w
      }
      else if (iiFree !== null) {
        H[iiFree!][iiFree!] += w
      }
      else if (jjFree !== null) {
        H[jjFree!][jjFree!] += w
      }

      if (eta > maxEta) maxEta = eta
    }

    // Ridge regularization: H += λI, g -= λβ
    for (let d = 0; d < pDim; d++) {
      H[d][d] += ridge
      g[d] -= ridge * beta[d]
    }

    // Solve H * delta = g  (Newton step)
    const delta = choleskySolve(H, g)
    const newBeta = beta.map((v, k) => v + delta[k])

    if (l2norm(newBeta.map((v, k) => v - beta[k])) < tol) {
      beta = newBeta
      break
    }
    beta = newBeta
  }

  // Reconstruct full strengths s (with anchor = 0)
  const s = new Array(teams.length).fill(0)
  for (let k = 0; k < teams.length; k++) {
    if (k === anchorIdx) s[k] = 0
    else s[k] = beta[pos.get(k)!]
  }

  // Helpers for inference
  function pointProb(homeTeam: string, awayTeam: string) {
    const i = t2idx.get(homeTeam)
    const j = t2idx.get(awayTeam)
    if (i === undefined || j === undefined) throw new Error('Unknown team')
    const p = sigmoid(s[i] - s[j])
    return p
  }
  function matchBreakdown(homeTeam: any, awayTeam: any, method = '/competitie/puntentelmethodes/4-1-sets') {
    if (!predictionPossible(homeTeam, awayTeam)) {
      return null
    }
    return matchProbs(pointProb(homeTeam, awayTeam), method, avgSetPoints)
  }
  function buildComponents() {
    const N = teams.length
    const adj: Array<number[]> = Array.from({ length: N }, () => [])
    for (const r of rows) {
      adj[r.i!].push(r.j!)
      adj[r.j!].push(r.i!)
    }
    const comp = new Array(N).fill(-1)
    let cid = 0
    for (let s = 0; s < N; s++) {
      if (comp[s] !== -1) continue
      // BFS
      const q = [s]
      comp[s] = cid
      while (q.length) {
        const u = q.shift()
        for (const v of adj[u!]) if (comp[v] === -1) {
          comp[v] = cid
          q.push(v)
        }
      }
      cid++
    }
    return comp // component id per team index
  }
  function predictionPossible(homeTeam: string, awayTeam: string): boolean {
    const i = t2idx.get(homeTeam)
    const j = t2idx.get(awayTeam)
    if (i === undefined || j === undefined) throw new Error('Unknown team')
    const comp = buildComponents()
    return comp[i] === comp[j]
  }
  function canPredictAllMatches(): boolean {
    const comp = buildComponents()
    const firstComp = comp[0]
    return comp.every(c => c === firstComp)
  }
  // Map strengths
  const strengths: Record<string, number> = {}
  teams.forEach((t: string, k) => (strengths[t] = s[k]))

  return { teams, anchorTeam, strengths, pointProb, matchBreakdown, predictionPossible, canPredictAllMatches }
}

function makeBT(poule: Poule, anchorTeam: string | undefined = undefined): BTModel {
  const teams = poule.teams.map((t: { omschrijving: any }) => t.omschrijving)
  let matches = poule.matches
  const avgSetPoints = matches.flatMap(m => m.setstanden ? m.setstanden.map(s => s.puntenA + s.puntenB) : []).reduce((a, b) => a + b, 0) / (matches.flatMap(m => m.setstanden ? m.setstanden : []).length || 1)
  matches = matches.filter(m => m.eindstand)
  if (!anchorTeam) {
    anchorTeam = matches[0].teams[0].omschrijving
  }
  const orderedMatches = matches.sort((a, b) => {
    const dateA = new Date(`${a.datum}T${a.tijdstip}`)
    const dateB = new Date(`${b.datum}T${b.tijdstip}`)
    return dateB.getTime() - dateA.getTime()
  })
  let matchesForBT = matches.map(m => ({
    homeTeam: m.teams[0].omschrijving,
    awayTeam: m.teams[1].omschrijving,
    homePoints: m.setstanden ? m.setstanden.reduce((a, b) => a + b.puntenA, 0) : 0,
    awayPoints: m.setstanden ? m.setstanden.reduce((a, b) => a + b.puntenB, 0) : 0,
    weight: Math.pow(0.95, orderedMatches.filter(om => om.teams.map(t => t.omschrijving).includes(m.teams[0].omschrijving) || om.teams.map(t => t.omschrijving).includes(m.teams[1].omschrijving)).indexOf(m) + 1),
  }))

  matchesForBT = matchesForBT.filter(m => m.homePoints + m.awayPoints > 0)

  const bt = fitBTPoints(teams, matchesForBT, { anchorTeam, ridge: 0 }, avgSetPoints)
  return bt
}

// ---------- Exports ----------
export {
  fitBTPoints,
  setWinProb,
  matchProbs,
  makeBT,
}
