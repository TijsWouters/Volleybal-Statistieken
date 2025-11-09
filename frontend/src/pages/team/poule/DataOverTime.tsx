import { Typography, Paper } from '@mui/material'
import { LineChart, type CurveType } from '@mui/x-charts'
import dayjs from 'dayjs'
import COLORS from '@/assets/colors.json'

export default function DataOverTime({ poule }: { poule: DetailedPouleInfo }) {
  return (
    <Paper elevation={4}>
      <Typography variant="h4">Pouleverloop</Typography>
      <hr />
      <LineChart
        colors={COLORS}
        height={400}
        xAxis={[{ data: poule.timePoints, valueFormatter: (value: number) => dayjs(value).format('DD-MM-YYYY'), label: 'Datum', min: poule.timePoints[0], max: poule.timePoints[poule.timePoints.length - 1] }]}
        series={generateSeries(poule)}
        yAxis={[{ min: -0.1 }]}
      >
      </LineChart>
    </Paper>
  )
}

function generateSeries(poule: DetailedPouleInfo) {
  return poule.teams.map(team => ({
    data: poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team].points),
    label: team.omschrijving,
    curve: 'stepAfter' as CurveType,
    showMark: false,
  }))
}
