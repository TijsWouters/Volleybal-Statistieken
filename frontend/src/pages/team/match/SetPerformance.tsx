import { calculateStrengthDifference } from '@/statistics-utils/bradley-terry'
import { ChartsReferenceLine, LineChart } from '@mui/x-charts'

export default function SetPerformance({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const expectedStrengthDifference = match.strengthDifferenceWithoutCurrent! >= 0 ? '+' + (match.strengthDifferenceWithoutCurrent! * 100).toFixed(0) : (match.strengthDifferenceWithoutCurrent! * 100).toFixed(0)

  let colors: string[]
  if (match.neutral) {
    colors = ['var(--color-accent-light)', 'var(--color-accent-dark)']
  }
  else {
    colors = ['var(--color-red-opacity)', 'var(--color-green-opacity)']
  }

  return (
    <>
      <LineChart
        skipAnimation
        series={generateSeries(match)}
        xAxis={[{ label: 'Setnummer', position: 'bottom', data: [...Array(match.setstanden.length)].map((_, i) => i + 1), tickInterval: [...Array(match.setstanden.length)].map((_, i) => i + 1), valueFormatter: (v: number) => v.toFixed(0) }]}
        yAxis={[{
          label: 'Krachtverschil', position: 'left', width: 60, valueFormatter: (v: number) => v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0), colorMap: {
            type: 'piecewise',
            thresholds: [match.strengthDifferenceWithoutCurrent! * 100],
            colors: colors,
          },
        }]}
        height={320}
        slotProps={{
          legend: {
            sx: {
              fontSize: 18,
            },
          },
        }}
        hideLegend
      >
        <ChartsReferenceLine
          y={match.strengthDifferenceWithoutCurrent! * 100}
          label={match.strengthDifferenceWithoutCurrent ? `Verwacht krachtverschil (${expectedStrengthDifference})` : undefined}
          labelAlign="start"
          lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#000' }}
          labelStyle={{ fontSize: 16, fill: '#000c' }}
        />
      </LineChart>
    </>
  )
}

function generateSeries(match: DetailedMatchInfo) {
  const teamSide = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 0 ? 'puntenA' : 'puntenB'

  const resultingPointChances = match.setstanden!.map((set) => {
    const teamPoints = set[teamSide]
    const opponentPoints = teamSide === 'puntenA' ? set.puntenB : set.puntenA
    const totalPoints = teamPoints + opponentPoints

    return teamPoints / totalPoints
  })

  let resultingStrengthDifferences: number[]
  if (match.neutral) {
    resultingStrengthDifferences = resultingPointChances.map(pc => calculateStrengthDifference(pc) * -100)
  }
  else {
    resultingStrengthDifferences = resultingPointChances.map(pc => calculateStrengthDifference(pc) * 100)
  }

  return [
    {
      label: 'Krachtverschil',
      data: resultingStrengthDifferences,
      valueFormatter: (v: number | null) => v! > 0 ? `+${v!.toFixed(2)}` : v!.toFixed(2),
      area: !match.neutral,
      baseline: match.strengthDifferenceWithoutCurrent! * 100,
    },
  ]
}
