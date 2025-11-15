import { BarChart } from '@mui/x-charts'
import { Paper, Typography } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import { ViewportGate } from '@/components/ViewportGate'

// Vite:  const worker = new Worker(new URL("./bootstrap.worker.ts", import.meta.url), { type: "module" });
// Next.js (app router): use next-worker-plugin or fallback to plain JS worker.

export default function EndPositionChances({ poule }: { poule: DetailedPouleInfo }) {
  const [loading, setLoading] = useState(true)
  const [endPositionChances, setEndPositionChances] = useState<Record<string, number[]> | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // Create once
    workerRef.current = new Worker(new URL('./bootstrap.worker.ts', import.meta.url), { type: 'module' })
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!poule || !workerRef.current) return

    const handleMsg = (e: MessageEvent) => {
      const msg = e.data as { type: string, progress?: number, result?: any }
      if (msg.type === 'done') {
        // Example: adapt to your real result shape from worker
        setEndPositionChances(msg.result)
        setLoading(false)
      }
    }

    const w = workerRef.current
    w.addEventListener('message', handleMsg)

    // Kick off: pass ONLY the minimal data needed by the worker
    const minimal = /* derive minimal numeric inputs for bootstrap here */ getMinimalPouleData(poule)
    w.postMessage({ type: 'start', ...minimal })

    return () => w.removeEventListener('message', handleMsg)
  }, [poule])

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Eindpositie kansen</Typography>
      <hr />
      <ViewportGate estimatedHeight={400} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
        <BarChart
          height={400}
          series={generateSeries(endPositionChances)}
          colors={[...Array.from({ length: poule.teams.length }, (_, i) => positionToColor(i + 1, poule.teams.length))]}
          yAxis={[{ data: poule.teams.map(t => t.omschrijving), width: 80 }]}
          xAxis={[{ min: 0, max: 100, position: 'top' }]}
          barLabel={v => v ? (v.value! >= 10 ? v.seriesId!.toString() : '') : ''}
          layout="horizontal"
          hideLegend
          skipAnimation
          loading={loading}
          localeText={{
            loading: 'De competitie wordt gesimuleerd...',
          }}
          slotProps={{
            barLabel: { style: { fill: '#000000', fontWeight: 'bold' } },
          }}
        />
      </ViewportGate>
    </Paper>
  )
}

function getMinimalPouleData(poule: DetailedPouleInfo) {
  return {
    teams: poule.teams,
    matches: poule.matches,
    puntentelmethodeId: poule.puntentelmethode,
  }
}

function generateSeries(endPositionChances: Record<string, number[]> | null) {
  if (!endPositionChances) {
    return []
  }
  return Array.from({ length: Object.values(endPositionChances)[0]?.length || 0 }, (_, i) => ({
    data: Object.keys(endPositionChances).map(teamName => endPositionChances[teamName][i] * 100),
    valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
    label: (i + 1).toString() + 'e',
    stack: 'endPositionChances',
    id: (i + 1).toString() + 'e',
  }))
}

// Converts a strength (1 to teamCount) to a color from red (weak) to green (strong)
function positionToColor(position: number, teamCount: number) {
  let s = Math.max(1, Math.min(teamCount, position))
  s = (teamCount - s) * 100 / (teamCount - 1) // scale to 0-100
  const maxG = 255
  const maxR = 255

  let r, g = 0
  if (s < 50) {
    r = maxR
    g = Math.round(maxG / 50 * s)
  }
  else {
    g = maxG
    r = Math.round(maxR * 2 - (2 * maxR / 100) * s)
  }
  const h = r * 0x10000 + g * 0x100
  return '#' + ('000000' + h.toString(16)).slice(-6)
}
