import { Typography, Paper, ButtonGroup, Button } from '@mui/material'
import { ChartsLabelMark, LineChart, useLegend, type CurveType } from '@mui/x-charts'
import dayjs from 'dayjs'
import COLORS from '@/assets/colors.json'
import { useState } from 'react'
import type { SeriesId } from '@mui/x-charts/internals'

type Metric = 'points' | 'position' | 'strength'

export default function DataOverTime({ poule }: { poule: DetailedPouleInfo }) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('points')
  const [highlightedSeries, setHighlightedSeries] = useState<SeriesId | undefined>(undefined)

  const domain = getDomainForMetric(poule, selectedMetric)

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Pouleverloop</Typography>
      <hr />
      <ButtonGroup className="select-winrate-buttons">
        <Button variant={selectedMetric === 'points' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('points')}>Punten</Button>
        <Button variant={selectedMetric === 'position' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('position')}>Positie</Button>
        <Button variant={selectedMetric === 'strength' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('strength')}>Kracht</Button>
      </ButtonGroup>
      <LineChart
        colors={getColors(COLORS, highlightedSeries)}
        height={400}
        xAxis={[{ data: poule.timePoints, valueFormatter: (value: number) => dayjs(value).format('DD-MM-YYYY'), label: 'Datum', min: poule.timePoints[0], max: poule.timePoints[poule.timePoints.length - 1] }]}
        series={generateSeries(poule, selectedMetric)}
        yAxis={[{ reverse: selectedMetric === 'position', label: selectedMetric === 'points' ? 'Punten' : selectedMetric === 'position' ? 'Positie' : 'Kracht', min: domain![0], max: domain![1], tickNumber: 10 }]}
        slots={{
          legend: () => <MyCustomLegend highlightedSeries={highlightedSeries} setHighlightedSeries={setHighlightedSeries} />,
        }}
        slotProps={{
          line: { strokeWidth: getStrokeWidth(selectedMetric) },
        }}
      >
      </LineChart>
    </Paper>
  )
}

function getColors(initialColors: string[], highlightedSeries: SeriesId | undefined) {
  if (highlightedSeries === undefined) {
    return initialColors
  }
  return initialColors.map((color, index) => index === highlightedSeries ? color : color + '55')
}

function getDomainForMetric(poule: DetailedPouleInfo, metric: Metric) {
  if (metric === 'position') {
    return [0.5, poule.teams.length + 0.5]
  }
  else if (metric === 'points') {
    const maxPoints = Math.max(...poule.teams.map((team) => {
      return Math.max(...poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team].points))
    }))
    return [-0.5, maxPoints]
  }
  else if (metric === 'strength') {
    const maxStrength = Math.max(...poule.teams.map((team) => {
      return Math.max(...poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team].strength).filter(s => s !== null))
    }))
    const minStrength = Math.min(...poule.teams.map((team) => {
      return Math.min(...poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team].strength).filter(s => s !== null))
    }))
    return [minStrength! - 5, maxStrength + 5]
  }
}

function getStrokeWidth(metric: Metric) {
  if (metric === 'position') {
    return 15
  }
  return 3
}

function MyCustomLegend({ highlightedSeries, setHighlightedSeries }: { highlightedSeries: SeriesId | undefined, setHighlightedSeries: (seriesId: SeriesId | undefined) => void }) {
  const { items } = useLegend()
  return (
    <div style={{ margin: '8px', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
      {items.map((item) => {
        const { label, id, color, seriesId, markType } = item
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '4px',
              backgroundColor: seriesId === highlightedSeries ? color + '33' : 'transparent',
            }}
            onClick={() => highlightedSeries === seriesId ? setHighlightedSeries(undefined) : setHighlightedSeries(seriesId)}
            key={id}
          >
            <ChartsLabelMark type={markType} color={color} />
            <Typography sx={{ display: 'inline-block' }}>{`${label}`}</Typography>
          </div>
        )
      })}
    </div>
  )
}

function generateSeries(poule: DetailedPouleInfo, metric: Metric) {
  return poule.teams.map(team => ({
    id: poule.teams.findIndex(t => t.team === team.team),
    data: poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team][metric]),
    label: team.omschrijving,
    curve: 'linear' as CurveType,
    showMark: false,
  }))
}
