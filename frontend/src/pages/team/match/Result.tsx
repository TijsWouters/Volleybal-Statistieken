import { Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts'
import SetResults from '@/components/SetResults'

export default function Result({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const longestSet = Math.max(...match.setstanden.map(s => s.puntenA + s.puntenB))

  let colors: string[]
  if (match.neutral) {
    colors = ['var(--color-accent-dark)', 'var(--color-accent-light)']
  }
  else {
    colors = match.teams[0].omschrijving === match.fullTeamName ? ['var(--color-green)', 'var(--color-red)'] : ['var(--color-red)', 'var(--color-green)']
  }

  const totalPointsA = match.setstanden.reduce((acc, s) => acc + s.puntenA, 0)
  const totalPointsB = match.setstanden.reduce((acc, s) => acc + s.puntenB, 0)

  return (
    <>
      <SetResults match={match} teamName={match.fullTeamName} />
      <Typography variant="subtitle1" component="h2" align="center">
        {totalPointsA}
        {' '}
        -
        {' '}
        {totalPointsB}
      </Typography>
      <BarChart
        series={generateSeries(match)}
        yAxis={[{ position: 'none', min: 0, max: longestSet }]}
        xAxis={[{ data: match.setstanden.map(s => `Set ${s.set}`) }]}
        barLabel={v => v.value?.toFixed(0)}
        colors={colors}
        height={320}
        slotProps={{
          legend: {
            sx: {
              fontSize: 18,
            },
          },
          barLabel: {
            style: {
              fill: 'white',
              fontSize: 16,
            },
          },
        }}
      />
    </>
  )
}

function generateSeries(match: DetailedMatchInfo) {
  return [
    {
      label: match.teams[0].omschrijving,
      data: match.setstanden!.map(s => s.puntenA),
      stack: 'a',
    },
    {
      label: match.teams[1].omschrijving,
      data: match.setstanden!.map(s => s.puntenB),
      stack: 'a',
    },
  ]
}
