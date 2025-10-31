import { Typography, Paper } from '@mui/material'
import { calculateStrengthDifference } from '@/statistics-utils/bradley-terry'
import { ChartsReferenceLine, LineChart } from '@mui/x-charts'
import { ViewportGate } from '@/components/ViewportGate'

export default function SetPerformance({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const expectedStrengthDifference = -match.strengthDifferenceWithoutCurrent! >= 0 ? '+' + (-match.strengthDifferenceWithoutCurrent! * 100).toFixed(0) : (-match.strengthDifferenceWithoutCurrent! * 100).toFixed(0)

  return (
    <Paper>
      <Typography variant="h4" component="h2">Set performance</Typography>
      <hr />
      <ViewportGate estimatedHeight={320} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
        <LineChart
          skipAnimation
          series={generateSeries(match)}
          xAxis={[{ label: 'Setnummer', position: 'bottom', data: [...Array(match.setstanden.length)].map((_, i) => i + 1), tickInterval: [...Array(match.setstanden.length)].map((_, i) => i + 1), valueFormatter: (v: number) => v.toFixed(0) }]}
          yAxis={[{
            label: 'Krachtverschil', position: 'left', width: 60, min: -100, max: 100, valueFormatter: (v: number) => v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0), colorMap: {
              type: 'piecewise',
              thresholds: [-match.strengthDifferenceWithoutCurrent! * 100],
              colors: ['#8B0000bb', '#006400bb'],
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
            y={-match.strengthDifferenceWithoutCurrent! * 100}
            label={`Verwacht krachtverschil (${expectedStrengthDifference})`}
            labelAlign="start"
            lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#000' }}
            labelStyle={{ fontSize: 16, fill: '#000c' }}
          />
        </LineChart>
      </ViewportGate>
    </Paper>
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

  const resultingStrengthDifferences = resultingPointChances.map(pc => calculateStrengthDifference(pc) * 100)

  return [
    {
      label: 'Krachtverschil',
      data: resultingStrengthDifferences,
      valueFormatter: (v: number | null) => v! > 0 ? `+${v!.toFixed(2)}` : v!.toFixed(2),
      area: true,
      baseline: match.strengthDifferenceWithoutCurrent! * -100,
    },
  ]
}
