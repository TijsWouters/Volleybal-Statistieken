import { BarChart, useDrawingArea, useYScale, type BarItem } from '@mui/x-charts'
import { Button, ButtonGroup, LinearProgress, Paper, Typography } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import { ViewportGate } from '@/components/ViewportGate'
import { PD_COLORS } from '@/components/Standing'

type Metric = 'position' | 'promotionAndRelegation'

export default function EndPositionChances({ poule }: { poule: DetailedPouleInfo }) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [metric, setMetric] = useState<Metric>('position')
  const [endPositionChances, setEndPositionChances] = useState<Record<string, number[]> | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
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
      else if (msg.type === 'progress') {
        setProgress(msg.progress!)
      }
    }

    const w = workerRef.current
    w.addEventListener('message', handleMsg)

    const minimal = getMinimalPouleData(poule)
    w.postMessage({ type: 'start', ...minimal })

    return () => w.removeEventListener('message', handleMsg)
  }, [poule])

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Eindpositie kansen</Typography>
      <hr />
      <ButtonGroup className="select-metric-button-group">
        <Button variant={metric === 'position' ? 'contained' : 'outlined'} onClick={() => setMetric('position')}>Eindpositie</Button>
        <Button variant={metric === 'promotionAndRelegation' ? 'contained' : 'outlined'} onClick={() => setMetric('promotionAndRelegation')}>Promotie/Degradatie</Button>
      </ButtonGroup>
      <ViewportGate estimatedHeight={400} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
        <BarChart
          height={400}
          series={generateSeries(endPositionChances, poule.pdRegeling, metric)}
          colors={getColors(metric, poule.teams.length)}
          yAxis={[{ data: poule.teams.map(t => t.omschrijving), width: 80 }]}
          xAxis={[{ min: 0, max: 100, position: 'top' }]}
          barLabel={getBarLabel(metric)}
          layout="horizontal"
          skipAnimation
          loading={loading}
          slotProps={{
            barLabel: { style: { fill: '#000000', fontWeight: 'bold' } },
          }}
          slots={{
            loadingOverlay: () => <LoadingOverlay progress={progress} />,
          }}
        />
      </ViewportGate>
    </Paper>
  )
}

function getBarLabel(metric: Metric): (item: BarItem) => string {
  if (metric === 'position') {
    return (item: BarItem) => item.value && item.value > 10 ? item.seriesId.toString() : ''
  }
  else {
    return () => ''
  }
}

function getColors(metric: Metric, teamCount: number): string[] {
  if (metric === 'position') {
    return Array.from({ length: teamCount }, (_, i) => positionToColor(i + 1, teamCount))
  }
  else if (metric === 'promotionAndRelegation') {
    return Object.values(PD_COLORS)
  }
  return []
}

function LoadingOverlay({ progress }: { progress: number }) {
  const yScale = useYScale<'band'>()
  const { left, width } = useDrawingArea()

  const [bottom, top] = yScale.range()

  return (
    <>
      {yScale.domain().map((item, index) => {
        const barHeight = yScale.bandwidth()

        return (
          <rect
            key={index}
            x={left}
            y={yScale(item)}
            width={width}
            height={barHeight}
            fill="#ccc"
            opacity={0.3}
          />
        )
      })}
      <text x={left + width / 2} y={top + (bottom - top) / 2 - 10} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight="bold">
        De competitie wordt gesimuleerd:
        {' '}
        {Math.round(progress * 100)}
        %
      </text>
      <switch>
        <foreignObject x={left + width / 10} y={top + (bottom - top) / 2} width={width - (width / 10 * 2)} height={60} textAnchor="middle" dominantBaseline="middle">
          <LinearProgress variant="determinate" value={progress * 100} />
        </foreignObject>
      </switch>

    </>
  )
}

function getMinimalPouleData(poule: DetailedPouleInfo) {
  return {
    teams: poule.teams,
    matches: poule.matches,
    puntentelmethodeId: poule.puntentelmethode,
  }
}

function generateSeries(endPositionChances: Record<string, number[]> | null, pdRegeling: PDRegeling, metric: Metric) {
  if (!endPositionChances) {
    return []
  }
  if (metric === 'position') {
    return Array.from({ length: Object.values(endPositionChances)[0]?.length || 0 }, (_, i) => ({
      data: Object.keys(endPositionChances).map(teamName => endPositionChances[teamName][i] * 100),
      valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
      label: (i + 1).toString() + 'e',
      stack: 'endPositionChances',
      id: (i + 1).toString() + 'e',
    }))
  }
  else {
    const endResultChances = Object.entries(endPositionChances).map(([teamName, chances]) => {
      const initialResultChances = {
        champion: 0,
        promotion: 0,
        promotionMatches: 0,
        safe: 0,
        relegationMatches: 0,
        relegation: 0,
      }
      const newResultChances = chances.reduce<Record<string, number>>((acc, chance, index) => {
        {
          const position = index + 1
          if (position === 1) {
            acc.champion += chance
          }
          else if (pdRegeling.aantalPromotie && position <= pdRegeling.promotieLaagste!) {
            acc.promotion += chance
          }
          else if (pdRegeling.aantalPromotiewedstrijden && position <= pdRegeling.promotiewedstrijdenLaagste!) {
            acc.promotionMatches += chance
          }
          else if (pdRegeling.aantalHandhaving && position <= pdRegeling.handhavingLaagste!) {
            acc.safe += chance
          }
          else if (pdRegeling.aantalDegradatiewedstrijden && position <= pdRegeling.degradatiewedstrijdenLaagste!) {
            acc.relegationMatches += chance
          }
          else if (pdRegeling.aantalDegradatie && position <= pdRegeling.degradatieLaagste!) {
            acc.relegation += chance
          }
          return acc
        }
      }, initialResultChances)
      return [teamName, newResultChances]
    }) as [string, Record<string, number>][]
    return [
      {
        data: endResultChances.map(([, chances]) => chances.champion * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Kampioen',
        id: 'Kampioen',
        stack: 'endResultChances',
      },
      {
        data: endResultChances.map(([, chances]) => chances.promotion * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Promotie',
        id: 'Promotie',
        stack: 'endResultChances',
      },
      {
        data: endResultChances.map(([, chances]) => chances.promotionMatches * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Promotiewedstrijden',
        id: 'Promotiewedstrijden',
        stack: 'endResultChances',
      },
      {
        data: endResultChances.map(([, chances]) => chances.safe * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Handhaving',
        id: 'Handhaving',
        stack: 'endResultChances',
      },
      {
        data: endResultChances.map(([, chances]) => chances.relegationMatches * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Degradatiewedstrijden',
        id: 'Degradatiewedstrijden',
        stack: 'endResultChances',
      },
      {
        data: endResultChances.map(([, chances]) => chances.relegation * 100),
        valueFormatter: (v: number | null) => `${(v ? v : 0).toFixed(1)}%`,
        label: 'Degradatie',
        id: 'Degradatie',
        stack: 'endResultChances',
      },
    ]
  }
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
