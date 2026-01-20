import { Typography } from '@mui/material'
import { BarChart, ChartsReferenceLine } from '@mui/x-charts'
import SetResults from '@/components/SetResults'
import { CustomLegend } from '@/components/CustomLegend'

export default function Result({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const longestSet = Math.max(...match.setstanden.map(s => [s.puntenA, s.puntenB].reduce((a, b) => Math.max(a, b), 0)))

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
      <Typography variant="subtitle1" component="h2" align="center" className="dark:text-white">
        {totalPointsA}
        {' '}
        -
        {' '}
        {totalPointsB}
      </Typography>
      <BarChart
        series={generateSeries(match)}
        xAxis={[{ min: -longestSet, max: longestSet, valueFormatter: (v: number) => Math.abs(v).toFixed(0), position: 'bottom' }]}
        yAxis={[{ data: match.setstanden.map(s => `Set ${s.set}`), position: 'none', width: 0 }]}
        barLabel={v => Math.abs(v.value!).toFixed(0)}
        colors={colors}
        height={200}
        slots={{
          legend: () => <CustomLegend cutoffText={true} />,
        }}
        layout="horizontal"
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
              fontWeight: 'bold',
            },
          },
        }}
      >
        <ChartsReferenceLine
          x={0}
          lineStyle={{ strokeWidth: 1, stroke: localStorage.theme === 'dark' ? '#fff' : '#000' }}
        />
      </BarChart>
    </>
  )
}

function generateSeries(match: DetailedMatchInfo) {
  return [
    {
      label: match.teams[0].omschrijving,
      data: match.setstanden!.map(s => -s.puntenA),
      stack: 'a',
      valueFormatter: (v: number | null) => v !== null ? Math.abs(v).toFixed(0) : '',
    },
    {
      label: match.teams[1].omschrijving,
      data: match.setstanden!.map(s => s.puntenB),
      stack: 'a',
      valueFormatter: (v: number | null) => v !== null ? Math.abs(v).toFixed(0) : '',
    },
  ]
}
