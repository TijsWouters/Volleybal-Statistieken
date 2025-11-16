import { getOutcomeProbabilities } from '@/statistics-utils/championship-bootstrap'

type MsgIn = { type: 'start', teams: Team[], matches: Match[], puntentelmethodeId: string }
type MsgOut
  = | { type: 'progress', progress: number }
    | { type: 'done', result: Record<string, number[]> }

self.onmessage = (e: MessageEvent<MsgIn>) => {
  const { teams, matches, puntentelmethodeId } = e.data
  if (e.data.type !== 'start') return

  const progressUpdate = (progress: number) => {
    (self as unknown as Worker).postMessage({ type: 'progress', progress } as MsgOut)
  }

  const result = getOutcomeProbabilities(teams, matches, puntentelmethodeId, progressUpdate);

  (self as unknown as Worker).postMessage({ type: 'done', result } as MsgOut)
}
