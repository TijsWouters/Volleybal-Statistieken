import { CustomLegend } from '@/components/CustomLegend'
import { calculateStrengthDifference } from '@/statistics-utils/bradley-terry'
import { ChartsReferenceLine, LineChart } from '@mui/x-charts'

export default function SetPerformance({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const expectedStrengthDifference = match.strengthDifferenceWithoutCurrent! >= 0 ? '+' + (match.strengthDifferenceWithoutCurrent! * 100).toFixed(0) : (match.strengthDifferenceWithoutCurrent! * 100).toFixed(0)

  let colors: string[]
  if (match.neutral) {
    colors = ['var(--color-accent-light-opacity)', 'var(--color-accent-dark-opacity)']
  }
  else {
    colors = ['var(--color-red-opacity)', 'var(--color-green-opacity)']
  }

  const series = generateSeries(match)

  const awayMatch = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 1

  return (
    <>
      <LineChart
        slots={{
          legend: () => <CustomLegend items={match.teams.map((team, index) => ({ color: colors[(index + (!match.neutral && awayMatch ? 0 : 1)) % 2], label: team.omschrijving, seriesId: team.omschrijving }))} cutoffText={true} />,
        }}
        skipAnimation
        series={series}
        xAxis={[{
          label: 'Setnummer',
          position: 'bottom',
          data: [0.5, ...[...Array(match.setstanden.length)].map((_, i) => i + 1), match.setstanden.length + 0.5],
          tickInterval: [...Array(match.setstanden.length)].map((_, i) => i + 1),
          valueFormatter: (v: number) => v.toFixed(0),
          min: 0.5,
          max: match.setstanden.length + 0.5,
        }]}
        yAxis={[{
          position: 'left', width: 37, valueFormatter: (v: number) => v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0), colorMap: {
            type: 'piecewise',
            thresholds: [match.strengthDifferenceWithoutCurrent! * 100],
            colors: colors,
          },
          min: Math.min(...series[0].data, Number(expectedStrengthDifference)) - 10,
          max: Math.max(...series[0].data, Number(expectedStrengthDifference)) + 10,
        }]}
        height={320}
        slotProps={{
          legend: {
            sx: {
              fontSize: 16,
            },
          },
        }}
      >
        <ChartsReferenceLine
          y={match.strengthDifferenceWithoutCurrent! * 100}
          label={match.strengthDifferenceWithoutCurrent ? `Verwacht krachtverschil (${expectedStrengthDifference})` : undefined}
          labelAlign="start"
          lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: localStorage.theme === 'dark' ? '#fff' : '#000' }}
          labelStyle={{ fontSize: 16, fill: localStorage.theme === 'dark' ? '#fff' : '#000' }}
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

  // Add point before and after to avoid just a single point without an area
  resultingStrengthDifferences = [match.strengthDifferenceWithoutCurrent! * 100, ...resultingStrengthDifferences, match.strengthDifferenceWithoutCurrent! * 100]

  return [
    {
      label: 'Krachtverschil',
      data: resultingStrengthDifferences,
      valueFormatter: (v: number | null) => v! > 0 ? `+${v!.toFixed(2)}` : v!.toFixed(2),
      area: true,
      baseline: match.strengthDifferenceWithoutCurrent! * 100,
      showMark: ({ index }: { index: number }) => index !== 0 && index !== resultingStrengthDifferences.length - 1,
    },
  ]
}
