// btPoints.js
// Bradley–Terry on rally points (no home/recency).
// Fits strengths s_i so that logit(p_ij) = s_i - s_j by IRLS (logistic regression with ridge).

export interface BTModel {
  teams: string[]
  anchorTeam: string
  strengths: Record<string, number>
  pointProb: (homeTeam: string, awayTeam: string) => number
  matchBreakdown: (homeTeam: string, awayTeam: string, method?: string) => Record<string, number> | null
  predictionPossible: (homeTeam: string, awayTeam: string) => boolean
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
  if (pointChance <= 0) return -Infinity
  if (pointChance >= 1) return Infinity
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

function matchProbsBestOf5(p: number, method: string) {
  const s = setWinProb(p, 25)
  const t = setWinProb(p, 15) // fifth set
  const out: Record<string, number> = {}

  if (method === '/competitie/puntentelmethodes/best-of-5') {
    out['3-0'] = Math.pow(s, 3)
    out['3-1'] = 3 * Math.pow(s, 3) * (1 - s)
    out['3-2'] = comb(4, 2) * Math.pow(s, 2) * Math.pow(1 - s, 2) * t
    out['2-3'] = comb(4, 2) * Math.pow(s, 2) * Math.pow(1 - s, 2) * (1 - t)
    out['1-3'] = 3 * s * Math.pow(1 - s, 3)
    out['0-3'] = Math.pow(1 - s, 3)
  }
  else if (method === '/competitie/puntentelmethodes/4-1-sets' || method === '/competitie/puntentelmethodes/4-1-sets-zonder-maximum') {
    out['4-0'] = Math.pow(s, 4)
    out['3-1'] = 4 * Math.pow(s, 3) * (1 - s)
    out['3-2'] = comb(4, 2) * Math.pow(s, 2) * Math.pow(1 - s, 2) * t
    out['2-3'] = comb(4, 2) * Math.pow(s, 2) * Math.pow(1 - s, 2) * (1 - t)
    out['1-3'] = 4 * s * Math.pow(1 - s, 3)
    out['0-4'] = Math.pow(1 - s, 4)
  }
  else if (method === '/competitie/puntentelmethodes/2-sets-min-verschil-0') {
    out['4-0'] = s * s
    out['2-2'] = 2 * s * (1 - s)
    out['0-4'] = (1 - s) * (1 - s)
  }
  else if (method === '/competitie/puntentelmethodes/best-of-3') {
    out['2-0'] = s * s
    out['2-1'] = 2 * s * (1 - s)
    out['1-2'] = 2 * s * (1 - s)
    out['0-2'] = (1 - s) * (1 - s)
  }
  else if (method === '/competitie/puntentelmethodes/1-set-min-verschil-0') {
    out['2-0'] = s
    out['0-2'] = (1 - s)
  }
  else if (method === '/competitie/puntentelmethodes/4-sets-min-verschil-0') {
    out['8-0'] = Math.pow(s, 4)
    out['6-2'] = comb(4, 1) * Math.pow(s, 3) * (1 - s)
    out['4-4'] = comb(4, 2) * Math.pow(s, 2) * Math.pow(1 - s, 2)
    out['2-6'] = comb(4, 1) * s * Math.pow(1 - s, 3)
    out['0-8'] = Math.pow(1 - s, 4)
  }

  const formattedOut: Record<string, number> = {}
  for (const [key, value] of Object.entries(out)) {
    formattedOut[key] = (value * 100)
  }

  // out["A_win"] = out["3-0"] + out["3-1"] + out["3-2"];
  return formattedOut
}

// ---------- Core BT fit (no home/recency) ----------
function fitBTPoints(
  teams: string[],
  matches: { homeTeam: string, awayTeam: string, homePoints: number, awayPoints: number }[],
  opts: { ridge?: number, maxIter?: number, tol?: number, anchorTeam?: string } = {},
): BTModel {
  const ridge = opts.ridge ?? 0.1
  const maxIter = opts.maxIter ?? 100
  const tol = opts.tol ?? 1e-8

  teams.sort()

  // Anchor: fix one team to 0 to identify the model
  const anchorTeam = opts.anchorTeam ?? teams[teams.length - 1]
  if (!teams.includes(anchorTeam)) throw new Error('anchorTeam not present in matches')

  const t2idx = new Map(teams.map((t, i) => [t, i]))
  const anchorIdx = t2idx.get(anchorTeam)
  const free = teams.map((_, i) => i).filter(i => i !== anchorIdx)
  const pos = new Map(free.map((k, i) => [k, i])) // team index -> column index

  // Convenience accessors per row
  const rows = matches.map((r: { homeTeam: string, awayTeam: string, homePoints: any, awayPoints: any }) => {
    const i = t2idx.get(r.homeTeam)
    const j = t2idx.get(r.awayTeam)
    const y = r.homePoints
    const n = r.homePoints + r.awayPoints
    return { i, j, y, n }
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
      if (iiFree !== null) g[iiFree!] += resid
      if (jjFree !== null) g[jjFree!] -= resid

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
    if (!predictionPossible(homeTeam, awayTeam)) return null
    return matchProbsBestOf5(pointProb(homeTeam, awayTeam), method)
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
  // Map strengths
  const strengths: Record<string, number> = {}
  teams.forEach((t: string, k) => (strengths[t] = s[k]))

  return { teams, anchorTeam, strengths, pointProb, matchBreakdown, predictionPossible }
}

function makeBT(poule: Poule, anchorTeam: string | undefined = undefined): BTModel {
  const teams = poule.teams.map((t: { omschrijving: any }) => t.omschrijving)
  let matches = poule.matches
  matches = matches.filter(m => m.eindstand)
  if (!anchorTeam) {
    anchorTeam = matches[0].teams[0].omschrijving
  }
  let matchesForBT = matches.map(m => ({
    homeTeam: m.teams[0].omschrijving,
    awayTeam: m.teams[1].omschrijving,
    homePoints: m.setstanden ? m.setstanden.reduce((a, b) => a + b.puntenA, 0) : 0,
    awayPoints: m.setstanden ? m.setstanden.reduce((a, b) => a + b.puntenB, 0) : 0,
  }))

  matchesForBT = matchesForBT.filter(m => m.homePoints + m.awayPoints > 0)

  const bt = fitBTPoints(teams, matchesForBT, { anchorTeam, ridge: 0 })
  return bt
}

// ---------- Exports ----------
export {
  fitBTPoints,
  setWinProb,
  matchProbsBestOf5,
  makeBT,
}
