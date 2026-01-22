import { Typography } from '@mui/material'
import { LineChart, ChartsReferenceLine } from '@mui/x-charts'
import { useMemo } from 'react'
import { calculateStrengthDifference, makeBT } from '@/statistics-utils/bradley-terry'
import { sortByDateAndTime } from '@/utils/sorting'
import type { Data } from '@/query'

type FormPoint = {
  value: number
}

export default function TeamFormChart({ data }: { data: Data }) {
  const points = useMemo(() => buildFormPoints(data), [data])

  if (points.length === 0) {
    return null
  }

  const xData = points.map((_, index) => index + 1)
  const yData = points.map(point => point.value)
  const minY = Math.min(...yData, -5)
  const maxY = Math.max(...yData, 5)
  const xMin = xData[0]
  const xMax = xData[xData.length - 1]
  const colors = ['var(--color-red-opacity)', 'var(--color-green-opacity)']

  return (
    <div className="w-full border border-panel-border rounded-lg p-2 bg-panel flex flex-col items-center">
      <Typography variant="h6" fontWeight={500} fontSize={18}>Vorm</Typography>
      <div className="flex w-full">
        <LineChart
          height={200}
          skipAnimation
          xAxis={[{
            data: xData,
            valueFormatter: (value: number) => value.toFixed(0),
            min: xMin,
            max: xMax,
            height: 0,
          }]}
          yAxis={[{
            min: minY - 5,
            max: maxY + 5,
            width: 30,
            valueFormatter: (value: number) => value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0),
            colorMap: {
              type: 'piecewise',
              thresholds: [0],
              colors,
            },
          }]}
          series={[{
            data: yData,
            showMark: true,
            area: true,
            baseline: 0,
            valueFormatter: (value: number | null) => value ? (value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)) : '',
          }]}
        >
          <ChartsReferenceLine y={0} lineStyle={{ strokeDasharray: '6 6' }} />
        </LineChart>
      </div>
    </div>
  )
}

function buildFormPoints(data: Data): FormPoint[] {
  const teamName = data.fullTeamName
  const matches = data.poules
    .flatMap(poule => poule.matches.map(match => ({ match, poule })))
    .filter(({ match }) => match.status.waarde === 'gespeeld')
    .filter(({ match }) => match.teams.some(team => team.omschrijving === teamName))
    .sort((a, b) => sortByDateAndTime(a.match, b.match))

  const points: FormPoint[] = []

  for (const { match, poule } of matches) {
    if (!match.setstanden || match.setstanden.length === 0) continue

    const teamIndex = match.teams.findIndex(team => team.omschrijving === teamName)
    if (teamIndex === -1) continue
    const opponentIndex = teamIndex === 0 ? 1 : 0

    const matchesWithoutCurrent = poule.matches.filter(m => m.uuid !== match.uuid && m.eindstand)
    if (matchesWithoutCurrent.length === 0) continue

    const bt = makeBT({ ...poule, matches: matchesWithoutCurrent }, teamName, false)
    if (!bt.predictionPossible(match.teams[teamIndex].omschrijving, match.teams[opponentIndex].omschrijving)) continue

    const expectedDiff = bt.strengths[match.teams[teamIndex].omschrijving] - bt.strengths[match.teams[opponentIndex].omschrijving]

    const totalPoints = match.setstanden.reduce((sum, set) => sum + set.puntenA + set.puntenB, 0)
    if (totalPoints === 0) continue
    const teamPoints = match.setstanden.reduce((sum, set) => sum + (teamIndex === 0 ? set.puntenA : set.puntenB), 0)
    const actualDiff = calculateStrengthDifference(teamPoints / totalPoints)

    const value = (actualDiff - expectedDiff) * 100
    if (!Number.isFinite(value)) continue
    points.push({ value })
  }

  return points
}
