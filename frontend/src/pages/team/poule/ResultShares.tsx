import { PieChart, pieArcLabelClasses } from '@mui/x-charts'
import { Typography, Paper } from '@mui/material'
import COLORS from '@/assets/colors.json'

const COLD_COLORS = [COLORS[0], COLORS[4], COLORS[2]]
const WARM_COLORS = [COLORS[6], COLORS[3], COLORS[5]]

export default function ResultShares({ poule }: { poule: DetailedPouleInfo }) {
  if (!poule.showData) return null
  const fullSeries = generateSeriesFull(poule.matches)

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Uitslagenverdeling</Typography>
      <hr />
      <div className='result-shares-wrapper'>
        <PieChart
          style={{ display: 'inline' }}
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
        <PieChart
          title="Inclusief thuis-uit"
          style={{ display: 'inline' }}
          hideLegend
          series={fullSeries}
          height={300}
          colors={[...COLD_COLORS.slice(0, Math.floor(fullSeries[0].data.length/2)), ...WARM_COLORS.slice(0, Math.ceil(fullSeries[0].data.length/2))]}
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
      </div>
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

  const data = Object.entries(resultCounts).map(([key, value]) => ({ id: key, value, label: key }))
  data.sort((a, b) => {
    const [a1, a2] = a.id.split('-').map(Number)
    const [b1, b2] = b.id.split('-').map(Number)
    if (a1 !== b1) {
      return b1 - a1
    }
    return b2 - a2
  })

  return [{ data, arcLabel: 'label', arcLabelRadius: '70%', arcLabelMinAngle: 10 }]
}

function generateSeriesFull(matches: Match[]): any {
  const resultCounts: { [key: string]: number } = {}
  matches.forEach((match) => {
    if (!match.eindstand) return
    let resultKey = `${match.eindstand[0]}-${match.eindstand[1]}`
    if (resultCounts[resultKey]) {
      resultCounts[resultKey] += 1
    }
    else {
      resultCounts[resultKey] = 1
    }
  })

  const data = Object.entries(resultCounts).map(([key, value]) => ({ id: key, value, label: key }))
  data.sort((a, b) => {
    const [a1, a2] = a.id.split('-').map(Number)
    const [b1, b2] = b.id.split('-').map(Number)
    return (b1 - b2) - (a1 - a2)
  })

  return [{ data, arcLabel: 'label', arcLabelRadius: '70%', arcLabelMinAngle: 10 }]
}