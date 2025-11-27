import { BarChart } from '@mui/x-charts'
import { sigmoid, setWinProb } from '@/statistics-utils/bradley-terry'
import PUNTENTELMETHODES from '@/assets/puntentelmethodes.json'

export default function ChancesBarChart({ match }: { match: DetailedMatchInfo }) {
  const matchCanTie = PUNTENTELMETHODES.find(m => m['@id'] === match.puntentelmethode)?.mogelijkeUitslagen.some(u => u.setsA === u.setsB)

  let colors: string[]
  if (match.neutral) {
    if (matchCanTie) {
      colors = ['var(--color-accent-dark)', 'gray', 'var(--color-accent-light)']
    }
    else {
      colors = ['var(--color-accent-dark)', 'var(--color-accent-light)']
    }
  }
  else {
    if (matchCanTie) {
      colors = match.teams[0].omschrijving === match.fullTeamName ? ['var(--color-green)', 'gray', 'var(--color-red)'] : ['var(--color-red)', 'gray', 'var(--color-green)']
    }
    else {
      colors = match.teams[0].omschrijving === match.fullTeamName ? ['var(--color-green)', 'var(--color-red)'] : ['var(--color-red)', 'var(--color-green)']
    }
  }

  return (
    <BarChart
      skipAnimation
      series={generateSeries(match, matchCanTie!)}
      xAxis={[{ data: ['Punt', 'Set (25)', 'Set (15)', 'Wedstrijd'], height: 25 }]}
      height={320}
      barLabel={v => v.value! < 10 ? '' : `${v.value?.toFixed(1)}%`}
      colors={colors}
      yAxis={[{ position: 'none', min: 0, max: 100 }]}
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
  )
}

function generateSeries(match: DetailedMatchInfo, canTie: boolean) {
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
    ...canTie
      ? [{
          label: 'Gelijk spel',
          data: [null, null, null, (100 - winChances.left - winChances.right) < 0.0001 ? null : (100 - winChances.left - winChances.right)],
          stack: 'a',
          valueFormatter: (v: number | null) => v ? v?.toFixed(3) + '%' : null,
        }]
      : [],
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
