import { PieChart, pieArcLabelClasses } from '@mui/x-charts'
import { Typography, Paper } from '@mui/material'
import COLORS from '@/assets/colors.json'

export default function PointShares({ poule }: { poule: DetailedPouleInfo }) {
  if (!poule.showData) return null

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Puntenverdeling</Typography>
      <hr />
      <PieChart
        series={generateSeries(poule.teams)}
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

function generateSeries(teams: DetailedTeamInfo[]) {
  return [{ data: teams.map(t => ({ id: t['@id'], value: t.punten, label: t.omschrijving })), arcLabel: (v: { value: number }) => v.value.toString(), arcLabelRadius: '70%', arcLabelMinAngle: 10 }]
}
