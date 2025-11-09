import { PieChart, pieArcLabelClasses } from '@mui/x-charts'
import { Typography, Paper } from '@mui/material'
import COLORS from '@/assets/colors.json'

export default function ResultShares({ poule }: { poule: DetailedPouleInfo }) {
  return (
    <Paper elevation={4}>
      <Typography variant="h5">Uitslagenverdeling</Typography>
      <hr />
      <PieChart
        hideLegend
        series={generateSeries(poule.matches)}
        height={300}
        colors={COLORS}
        slotProps={{
          legend: {
            direction: 'horizontal',
            position: {
              vertical: 'middle',
              horizontal: 'center',
            },
          },
        }}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fontWeight: 'bold',
            fontSize: '1.2rem',
          },
        }}
      />
    </Paper>
  )
}

function generateSeries(matches: Match[]): any {
  const resultCounts: { [key: string]: number } = {}
  matches.forEach((match) => {
    if (!match.eindstand) return
    let resultKey
    if (match.eindstand[0] < match.eindstand[1]) {
      resultKey = `${match.eindstand[1]}-${match.eindstand[0]}`
    }
    else {
      resultKey = `${match.eindstand[0]}-${match.eindstand[1]}`
    }
    if (resultCounts[resultKey]) {
      resultCounts[resultKey] += 1
    }
    else {
      resultCounts[resultKey] = 1
    }
  })

  return [{ data: Object.entries(resultCounts).map(([key, value]) => ({ id: key, value, label: key })), arcLabel: 'label', arcLabelRadius: '70%', arcLabelMinAngle: 10 }]
}
