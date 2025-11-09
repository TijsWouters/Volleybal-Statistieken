import { Typography, Paper, ButtonGroup, Button } from '@mui/material'
import { LineChart, type CurveType } from '@mui/x-charts'
import dayjs from 'dayjs'
import COLORS from '@/assets/colors.json'
import { useState } from 'react'

type Metric = 'points' | 'position'

export default function DataOverTime({ poule }: { poule: DetailedPouleInfo }) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('points')

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Pouleverloop</Typography>
      <hr />
      <ButtonGroup className="select-winrate-buttons">
        <Button variant={selectedMetric === 'points' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('points')}>Punten</Button>
        <Button variant={selectedMetric === 'position' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('position')}>Positie</Button>
      </ButtonGroup>
      <LineChart
        colors={COLORS}
        height={400}
        xAxis={[{ data: poule.timePoints, valueFormatter: (value: number) => dayjs(value).format('DD-MM-YYYY'), label: 'Datum', min: poule.timePoints[0], max: poule.timePoints[poule.timePoints.length - 1] }]}
        series={generateSeries(poule, selectedMetric)}
        yAxis={[{ min: -0.1, reverse: selectedMetric === 'position', label: selectedMetric === 'points' ? 'Punten' : 'Positie' }]}
      >
      </LineChart>
    </Paper>
  )
}

function generateSeries(poule: DetailedPouleInfo, metric: Metric) {
  return poule.teams.map(team => ({
    data: poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team][metric]),
    label: team.omschrijving,
    curve: 'linear' as CurveType,
    showMark: false,
  }))
}
