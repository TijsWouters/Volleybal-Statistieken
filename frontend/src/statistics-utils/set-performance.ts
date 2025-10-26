export function setWinProbability(p: number, x: number, y: number): number {
  // p = probability A wins a rally
  // [x, y] = desired final score (A, B)
  // assumes x == 25 and y <= 23 (no deuce)
  // returns P(A wins 25–y or better)

  if (x !== 25) {
    return 0
  }
  const q = 1 - p
  let prob = 0
  for (let t = 0; t <= y; t++) {
    // probability that A wins 25–t exactly
    const comb = binom(24 + t, 24)
    prob += comb * Math.pow(p, 25) * Math.pow(q, t)
  }
  return prob
}

// helper: binomial coefficient n choose k
function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let res = 1
  for (let i = 1; i <= k; i++) {
    res *= (n - i + 1) / i
  }
  return res
}
