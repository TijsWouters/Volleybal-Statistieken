import { PieChart, pieArcLabelClasses } from '@mui/x-charts'
import { Typography } from '@mui/material'
import COLORS from '@/assets/colors.json'

export default function ResultShares({ poule }: { poule: DetailedPouleInfo }) {
  if (!poule.showData) return null
  const fullSeries = generateSeriesFull(poule.matches)

  return (
    <>
      <div className="result-shares-wrapper">
        <div>
          <Typography variant="h6" align="center">Zonder thuis-uit onderscheid</Typography>
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
        </div>
        <div>
          <Typography variant="h6" align="center">Met thuis-uit onderscheid</Typography>
          <PieChart
            title="Inclusief thuis-uit"
            style={{ display: 'inline' }}
            hideLegend
            series={fullSeries}
            height={300}
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
      </div>
    </>
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

  return [{ data, arcLabel: 'label', arcLabelRadius: '70%', arcLabelMinAngle: 15 }]
}

function keyToColor(key: string): string {
  const [scoreA, scoreB] = key.split('-').map(Number)
  if (scoreA > scoreB) {
    return 'var(--color-accent-dark)'
  }
  else if (scoreA < scoreB) {
    return 'var(--color-accent-light)'
  }
  else {
    return 'lightgray'
  }
}

function generateSeriesFull(matches: Match[]): any {
  const resultCounts: { [key: string]: number } = {}
  matches.forEach((match) => {
    if (!match.eindstand) return
    const resultKey = `${match.eindstand[0]}-${match.eindstand[1]}`
    if (resultCounts[resultKey]) {
      resultCounts[resultKey] += 1
    }
    else {
      resultCounts[resultKey] = 1
    }
  })

  const data = Object.entries(resultCounts).map(([key, value]) => ({ id: key, value, label: key, color: keyToColor(key) }))
  data.sort((a, b) => {
    const [a1, a2] = a.id.split('-').map(Number)
    const [b1, b2] = b.id.split('-').map(Number)
    return (b1 - b2) - (a1 - a2)
  })

  return [{ data, arcLabel: 'label', arcLabelRadius: '70%', arcLabelMinAngle: 15 }]
}
