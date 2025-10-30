/**
 * Probability that a rally is won by Team A: p (0..1).
 * We consider a 25-point set, must win by 2, deuces allowed.
 *
 * probSetOrBetter(p, x, y, team)
 *  - team = 'A' or 'B' (whose perspective “or better” is from)
 *  - (x, y) is the target final score (A, B).
 *    "or better for A" means A wins and B ≤ y.
 *    "or better for B" means B wins and A ≤ x.
 *
 * Ignores side-out/serve rules: rallies are i.i.d.
 */
export function probSetOrBetter(p: number, x: number, y: number, team = 'A') {
  if (!(p >= 0 && p <= 1)) throw new Error('p must be in [0,1]')
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
    throw new Error('x, y must be nonnegative integers')
  }
  const q = 1 - p

  // Helper: nCk
  function binom(n: number, k: number): number {
    if (k < 0 || k > n) return 0
    if (k > n - k) k = n - k // symmetry
    let res = 1
    for (let i = 1; i <= k; i++) {
      res *= (n - i + 1) / i
    }
    return res
  }

  // From 24–24:
  //   reach-deuce prob = C(48,24) p^24 q^24
  //   each "back-to-deuce" pair has prob r = 2pq
  //   A ends set after m cycles with p^2; B with q^2
  const reachDeuce = binom(48, 24) * Math.pow(p, 24) * Math.pow(q, 24)
  const r = 2 * p * q // geometric ratio (<1 unless p=0 or 1, where it is 0)

  function geomSum(mInclusive: number): number {
    // sum_{m=0..mInclusive} r^m
    if (mInclusive < 0) return 0
    if (r === 1) return mInclusive + 1 // (won’t actually occur for 0<=p<=1)
    return (1 - Math.pow(r, mInclusive + 1)) / (1 - r)
  }

  let prob = 0

  if (team === 'A') {
    // Non-deuce wins for A: exact 25–t with t <= 23
    const yCap = Math.min(y, 23)
    for (let t = 0; t <= yCap; t++) {
      prob += binom(24 + t, 24) * Math.pow(p, 25) * Math.pow(q, t)
    }
    // Deuce wins for A: opponent final = 24 + m, m >= 0
    if (y >= 24) {
      const mMax = y - 24
      prob += reachDeuce * Math.pow(p, 2) * geomSum(mMax)
    }
  }
  else if (team === 'B') {
    // Non-deuce wins for B: exact t–25 with t <= 23
    const xCap = Math.min(x, 23)
    for (let t = 0; t <= xCap; t++) {
      prob += binom(24 + t, 24) * Math.pow(q, 25) * Math.pow(p, t)
    }
    // Deuce wins for B: opponent final = 24 + m, m >= 0
    if (x >= 24) {
      const mMax = x - 24
      prob += reachDeuce * Math.pow(q, 2) * geomSum(mMax)
    }
  }
  else {
    throw new Error('team must be \'A\' or \'B\'')
  }

  return prob
}
