import { BarChart, ChartsReferenceLine, ChartsXAxis } from '@mui/x-charts'
import { Typography, Paper } from '@mui/material'

export default function TeamWinRates({ poule }: { poule: DetailedPouleInfo }) {
  const teamsSortedByMatchWinRate = [...poule.teams].sort((a, b) => b.matchWinRate - a.matchWinRate).slice(0, 3)
  const teamsSortedBySetWinRate = [...poule.teams].sort((a, b) => b.setWinRate - a.setWinRate)
  const teamsSortedByPointWinRate = [...poule.teams].sort((a, b) => b.pointWinRate - a.pointWinRate)

  return (
    <Paper elevation={4}>
      <Typography variant="h5">Team Winstpercentages</Typography>
      <hr />
      <BarChart
        skipAnimation
        height={300}
        series={generateSeries(teamsSortedByMatchWinRate)}
        yAxis={[{ position: 'none' }]}
        xAxis={[
          { data: teamsSortedByMatchWinRate.map(t => t.omschrijving), position: 'bottom', valueFormatter: (v: string) => v.split(' ').join('\n'), height: 50, tickLabelStyle: { width: 1000 } },
          { data: teamsSortedByMatchWinRate.map(t => (t.matchWinRate * 100).toFixed(1) + '%'), position: 'top', valueFormatter: (v: string) => v },
        ]}
      >
        <ChartsReferenceLine
          y={100}
          lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#000' }}
        />
      </BarChart>
    </Paper>
  )
}

function generateSeries(teams: DetailedTeamInfo[]) {
  return [{ data: teams.map(t => t.matchWinRate * 100), label: 'Wedstrijden' }]
}
