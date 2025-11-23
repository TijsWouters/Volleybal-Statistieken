import { BarChart } from '@mui/x-charts'
import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { interpolateRedToGreen } from '@/utils/interpolate-color'

type PredictionsBarChartProps = {
  prediction: Record<string, number> | null
  teamSide: 'left' | 'right' | null
  height?: number
  tooltip?: boolean
}

export default function PredictionsBarChart({ prediction, teamSide, height = 175, tooltip = true }: PredictionsBarChartProps) {
  const [useShort, setUseShort] = useState(window.innerWidth < 460)

  useEffect(() => {
    function handleResize() {
      setUseShort(window.innerWidth < 460)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    !prediction
      ? <Typography align="center" variant="body2" color="darkred">Niet genoeg data om voorspelling te maken</Typography>
      : (
          <div className="match-prediction">
            <BarChart
              skipAnimation
              series={mapResultChancesToSeries(prediction)}
              xAxis={mapResultChancesToXAxis(prediction, teamSide)}
              yAxis={[{ position: 'none', min: 0, max: Math.max(...Object.values(prediction)) }]}
              height={height}
              borderRadius={10}
              barLabel={v => v.value! < 5 ? '' : `${useShort ? Math.round(v.value!) : v.value?.toFixed(1)}%`}
              hideLegend
              loading={false}
              slotProps={{ tooltip: { trigger: tooltip ? 'axis' : 'none' }, barLabel: { style: { fill: '#ffffff', fontWeight: 'bold' } } }}
            />
          </div>
        ))
}

// Helper functions to create predictions bar chart
function mapResultChancesToSeries(resultChances: Record<string, number> | undefined) {
  if (!resultChances) return []
  return [{ data: Object.values(resultChances).map(Number), label: 'Kans', valueFormatter: (v: number | null) => v!.toFixed(3) + '%' }]
}

function mapResultChancesToXAxis(resultChances: Record<string, number> | undefined, teamSide: 'left' | 'right' | null) {
  if (!resultChances) return []
  return [{ data: Object.keys(resultChances), height: 25, colorMap: createColorMap(Object.keys(resultChances), teamSide) }]
}

function createColorMap(results: string[], teamSide: 'left' | 'right' | null): { colors: string[], type: 'ordinal' } {
  const colors = []
  const sortedResults = [...results].sort((a, b) => {
    const [a1, a2] = a.split('-').map(Number)
    const [b1, b2] = b.split('-').map(Number)
    return (a1 - a2) - (b1 - b2)
  })

  for (const result of sortedResults) {
    colors.push(resultToColor(result, teamSide))
  }

  return {
    colors,
    type: 'ordinal',
  }
}

function resultToColor(result: string, teamSide: 'left' | 'right' | null = null): string {
  if (!teamSide) return 'var(--color-primary)'
  const [scoreA, scoreB] = result.split('-').map(Number)
  const totalSets = scoreA + scoreB
  const aPercentage = (scoreA / totalSets)

  if (teamSide === 'right') return interpolateRedToGreen(aPercentage)
  if (teamSide === 'left') return interpolateRedToGreen(1 - aPercentage)
  return 'var(--color-primary)'
}
