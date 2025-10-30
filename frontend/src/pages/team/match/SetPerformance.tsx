import { Typography, Paper } from '@mui/material'
import { calculateStrengthDifference } from '@/statistics-utils/bradley-terry'
import { ChartsReferenceLine, LineChart } from '@mui/x-charts'
import { ViewportGate } from '@/components/ViewportGate'

export default function SetPerformance({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  return (
    <Paper>
      <Typography variant="h4" component="h2">Set performance</Typography>
      <hr />
      <ViewportGate estimatedHeight={320} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
        <LineChart
          series={generateSeries(match)}
          xAxis={[{ label: 'Setnummer', position: 'bottom', data: [...Array(match.setstanden.length)].map((_, i) => i + 1), tickInterval: [...Array(match.setstanden.length)].map((_, i) => i + 1), valueFormatter: (v: number) => v.toFixed(0) }]}
          yAxis={[{ label: 'Sterkteverschil', position: 'left', width: 50, min: -100, max: 100 }]}
          height={320}
          slotProps={{
            legend: {
              sx: {
                fontSize: 18,
              },
            },
          }}
          colors={['var(--color-50)']}
        >
          <ChartsReferenceLine
            y={-match.strengthDifference! * 100}
            label={`Verwacht sterkteverschil (${(-match.strengthDifference! * 100).toFixed(0)})`}
            labelAlign="start"
            lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#0009' }}
            labelStyle={{ fontSize: 16, fill: '#0009' }}
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
      label: 'Sterkteverschil',
      data: resultingStrengthDifferences,
    },
  ]
}
