import { BarChart } from '@mui/x-charts'
import { ViewportGate } from '@/components/ViewportGate'
import { sigmoid, setWinProb } from '@/statistics-utils/bradley-terry'

export default function ChancesBarChart({ match }: { match: DetailedMatchInfo }) {
  let colors: string[]
  if (match.neutral) {
    colors = ['var(--color-15)', 'var(--color-65)'] // arbitrarily choose left
  }
  else {
    colors = match.teams[0].omschrijving === match.fullTeamName ? ['darkgreen', 'gray', 'darkred'] : ['darkred', 'gray', 'darkgreen']
  }

  return (
    <ViewportGate estimatedHeight={320} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
      <BarChart
        skipAnimation
        series={generateSeries(match)}
        yAxis={[{ data: ['Punt', 'Set (25)', 'Set (15)', 'Wedstrijd'], width: 70 }]}
        height={320}
        layout="horizontal"
        barLabel={v => v.value! < 10 ? '' : `${v.value?.toFixed(1)}%`}
        colors={colors}
        xAxis={[{ position: 'none', min: 0, max: 100 }]}
        slotProps={{
          legend: {
            sx: {
              fontSize: 18,
            },
          },
          barLabel: {
            style: {
              fontWeight: 'bold',
              fill: 'white',
            },
          },
        }}
      >
      </BarChart>
    </ViewportGate>
  )
}

function generateSeries(match: DetailedMatchInfo) {
  let teamSide: 'left' | 'right'
  if (match.neutral) {
    teamSide = 'left' // arbitrarily choose left
  }
  else {
    teamSide = match.teams.findIndex(t => t.omschrijving === match.fullTeamName) === 0 ? 'left' : 'right'
  }
  const strengthDifference = match.strengthDifference!
  const pointChance = sigmoid(strengthDifference)
  const setChance25 = setWinProb(pointChance, 25)
  const setChance15 = setWinProb(pointChance, 15)
  const winChances = Object.entries(match.prediction!).reduce((acc, [key, value]) => {
    const [leftSets, rightSets] = key.split('-').map(Number)
    if (leftSets > rightSets) {
      acc.left += value
    }
    else if (rightSets > leftSets) {
      acc.right += value
    }
    return acc
  }, { left: 0, right: 0 })
  const result = [
    {
      label: match.teams[teamSide === 'left' ? 0 : 1].omschrijving,
      data: [pointChance * 100, setChance25 * 100, setChance15 * 100, winChances[teamSide]],
      stack: 'a',
      valueFormatter: (v: number | null) => v?.toFixed(3) + '%',
    },
    {
      label: 'Gelijk spel',
      data: [null, null, null, (100 - winChances.left - winChances.right) < 0.0001 ? null : (100 - winChances.left - winChances.right)],
      stack: 'a',
      valueFormatter: (v: number | null) => v ? v?.toFixed(3) + '%' : null,
    },
    {
      label: match.teams[teamSide === 'left' ? 1 : 0].omschrijving,
      data: [(1 - pointChance) * 100, (1 - setChance25) * 100, (1 - setChance15) * 100, winChances[teamSide === 'left' ? 'right' : 'left']],
      stack: 'a',
      valueFormatter: (v: number | null) => v?.toFixed(3) + '%',
    },
  ]
  if (match.teams[0].omschrijving === match.fullTeamName || match.neutral) {
    return result
  }
  else {
    return result.reverse()
  }
}
