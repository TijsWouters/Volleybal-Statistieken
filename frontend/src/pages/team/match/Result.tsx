import { ViewportGate } from '@/components/ViewportGate'
import { Typography, Paper } from '@mui/material'
import { BarChart } from '@mui/x-charts'
import SetResults from '@/components/SetResults'

export default function Result({ match }: { match: DetailedMatchInfo }) {
  if (!match.setstanden || match.setstanden.length === 0) {
    return null
  }

  const longestSet = Math.max(...match.setstanden.map(s => s.puntenA + s.puntenB))

  return (
    <Paper>
      <Typography variant="h4" component="h2">Setstanden</Typography>
      <hr />
      <SetResults match={match} teamName={match.fullTeamName} />
      <ViewportGate estimatedHeight={320} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
        <BarChart
          series={generateSeries(match)}
          yAxis={[{ position: 'none', min: 0, max: longestSet }]}
          barLabel={v => v.value?.toFixed(0)}
          colors={match.teams[0].omschrijving === match.fullTeamName ? ['darkgreen', 'darkred'] : ['darkred', 'darkgreen']}
          height={320}
          slotProps={{
            legend: {
              sx: {
                fontSize: 18,
              },
            },
          }}
        />
      </ViewportGate>
    </Paper>
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
