import { BarChart, PieChart, pieArcLabelClasses } from '@mui/x-charts'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { makeBT } from '@/statistics-utils/bradley-terry'
import { sortByDateAndTime } from '@/utils/sorting'

const ACCURACY_ITEMS = [
  { id: 'perfect', label: 'Exact', color: 'var(--color-green)' },
  { id: 'almost', label: 'Juiste winnaar', color: 'var(--color-accent)' },
  { id: 'wrong', label: 'Fout', color: 'var(--color-red)' },
]

type AccuracyCounts = {
  perfect: number
  almost: number
  wrong: number
}

export default function PredictionAccuracy({ poule }: { poule: DetailedPouleInfo }) {
  const { counts, total, teamCounts } = useMemo(() => calculatePredictionAccuracy(poule), [poule])

  if (total === 0) {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        Nog onvoldoende data om de voorspellingsnauwkeurigheid te berekenen.
      </Typography>
    )
  }

  const data = ACCURACY_ITEMS.map(item => ({
    id: item.id,
    label: item.label,
    value: counts[item.id as keyof AccuracyCounts],
    color: item.color,
  }))

  return (
    <div className="prediction-accuracy-wrapper">
      <div className="flex w-full">
        <PieChart
          className="inline-block self-center"
          series={[{
            data,
            arcLabel: item => `${Math.round((item.value / total) * 100)}%`,
            arcLabelRadius: '70%',
            arcLabelMinAngle: 10,
          }]}
          height={280}
          slotProps={{
            legend: {
              direction: 'horizontal',
              position: { vertical: 'top', horizontal: 'center' },
            },
          }}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontWeight: 'bold',
              fontSize: '1.1rem',
            },
          }}
        />
      </div>
      <div className="w-full flex">
        <BarChart
          className="w-full"
          height={Math.max(260, poule.teams.length * 32)}
          layout="horizontal"
          skipAnimation
          hideLegend
          xAxis={[{ min: 0, max: 100, height: 0 }]}
          yAxis={[{ data: poule.teams.map(t => t.omschrijving), width: 80 }]}
          series={generateTeamSeries(poule, teamCounts)}
          colors={ACCURACY_ITEMS.map(item => item.color)}
          barLabel={v => (v.value && v.value >= 8 ? `${v.value.toFixed(0)}%` : '')}
          slotProps={{
            legend: {
              direction: 'horizontal',
              position: { vertical: 'top', horizontal: 'center' },
            },
            barLabel: { style: { fill: '#fff', fontWeight: 'bold' } },
          }}
        />
      </div>
      <Typography variant="body2" color="textSecondary" align="center">
        Gebaseerd op
        {' '}
        {total}
        {' '}
        gespeelde wedstrijden met een beschikbare voorspelling.
      </Typography>
    </div>
  )
}

function calculatePredictionAccuracy(poule: DetailedPouleInfo) {
  const counts: AccuracyCounts = { perfect: 0, almost: 0, wrong: 0 }
  const sortedMatches = poule.matches.slice().sort(sortByDateAndTime)
  const previousMatches: Match[] = []
  const teamCounts: Record<string, AccuracyCounts> = {}
  for (const team of poule.teams) {
    teamCounts[team.omschrijving] = { perfect: 0, almost: 0, wrong: 0 }
  }
  const anchorTeam = poule.fullTeamName && poule.teams.some(t => t.omschrijving === poule.fullTeamName)
    ? poule.fullTeamName
    : poule.teams[0]?.omschrijving

  for (const match of sortedMatches) {
    if (!match.eindstand) continue

    if (previousMatches.length > 0 && anchorTeam) {
      const bt = makeBT({ ...poule, matches: previousMatches }, anchorTeam, true)
      const prediction = bt.matchBreakdown(match.teams[0].omschrijving, match.teams[1].omschrijving, poule.puntentelmethode)
      if (prediction) {
        const predictedSets = getMostLikelyOutcome(prediction)
        const actualSets: [number, number] = [match.eindstand[0], match.eindstand[1]]
        const verdict = classifyOutcome(predictedSets, actualSets)
        counts[verdict] += 1
        const teamA = match.teams[0].omschrijving
        const teamB = match.teams[1].omschrijving
        if (teamCounts[teamA]) teamCounts[teamA][verdict] += 1
        if (teamCounts[teamB]) teamCounts[teamB][verdict] += 1
      }
    }

    previousMatches.push(match)
  }

  const total = counts.perfect + counts.almost + counts.wrong
  return { counts, total, teamCounts }
}

function getMostLikelyOutcome(prediction: Record<string, number>): [number, number] {
  let bestKey = ''
  let bestValue = -Infinity
  for (const [key, value] of Object.entries(prediction)) {
    if (value > bestValue) {
      bestValue = value
      bestKey = key
    }
  }
  const [left, right] = bestKey.split('-').map(Number)
  return [left, right]
}

function classifyOutcome(predicted: [number, number], actual: [number, number]): keyof AccuracyCounts {
  if (predicted[0] === actual[0] && predicted[1] === actual[1]) return 'perfect'

  const predictedDiff = predicted[0] - predicted[1]
  const actualDiff = actual[0] - actual[1]
  if (predictedDiff === 0 || actualDiff === 0) return 'wrong'
  if ((predictedDiff > 0) !== (actualDiff > 0)) return 'wrong'

  return 'almost'
}

function generateTeamSeries(poule: DetailedPouleInfo, teamCounts: Record<string, AccuracyCounts>) {
  const teamNames = poule.teams.map(t => t.omschrijving)
  const totals = teamNames.map((name) => {
    const counts = teamCounts[name]
    return counts ? counts.perfect + counts.almost + counts.wrong : 0
  })
  return ACCURACY_ITEMS.map(item => ({
    label: item.label,
    data: teamNames.map((name, index) => {
      const total = totals[index]
      if (!total) return 0
      const count = teamCounts[name]?.[item.id as keyof AccuracyCounts] ?? 0
      return (count / total) * 100
    }),
    stack: 'accuracy',
    valueFormatter: (v: number | null) => (v && v > 0 ? `${v.toFixed(1)}%` : ''),
  }))
}
