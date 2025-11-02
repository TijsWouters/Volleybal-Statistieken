import { BarChart, ChartsReferenceLine } from '@mui/x-charts'
import { Typography, Paper, ButtonGroup, Button } from '@mui/material'
import { useState } from 'react'

const COLORS = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9']

export default function TeamWinRates({ poule }: { poule: DetailedPouleInfo }) {
  const [selectedMetric, setSelectedMetric] = useState<'matchWinRate' | 'setWinRate' | 'pointWinRate'>('matchWinRate')

  const dataToDisplay = poule.teams.sort((a, b) => a.positie - b.positie)

  return (
    <Paper elevation={4}>
      <Typography variant="h5">Team Winstpercentages</Typography>
      <hr />
      <ButtonGroup className="select-winrate-buttons">
        <Button variant={selectedMetric === 'matchWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('matchWinRate')}>Wedstrijden</Button>
        <Button variant={selectedMetric === 'setWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('setWinRate')}>Sets</Button>
        <Button variant={selectedMetric === 'pointWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('pointWinRate')}>Punten</Button>
      </ButtonGroup>
      <BarChart
        height={300}
        series={generateSeries(dataToDisplay, selectedMetric)}
        yAxis={[{ position: 'none', min: 0, max: 100 }]}
        xAxis={[
          { data: [0], position: 'bottom', tickLabelInterval: () => false, categoryGapRatio: 0 },
        ]}
        colors={COLORS}
      >
        <ChartsReferenceLine
          y={100}
          lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#000' }}
        />
      </BarChart>
    </Paper>
  )
}

function generateSeries(teams: DetailedTeamInfo[], dataKey: 'matchWinRate' | 'setWinRate' | 'pointWinRate' = 'matchWinRate') {
  return teams.map((t) => {
    return { data: [t[dataKey] * 100], label: t.omschrijving, valueFormatter: (v: number | null) => v!.toFixed(2) + '%' }
  })
}
