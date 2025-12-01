import { ButtonGroup, Button } from '@mui/material'
import dayjs from 'dayjs'
import COLORS from '@/assets/colors.json'
import { useState } from 'react'
import { type SeriesId } from '@mui/x-charts/internals'
import { LineChart, type CurveType, ChartsGrid, LinePlot, ChartsXAxis, ChartsYAxis } from '@mui/x-charts'
import { useDrawingArea } from '@mui/x-charts/hooks'
import { CustomLegend } from '@/components/CustomLegend'

type Metric = 'points' | 'position' | 'strength'

export default function DataOverTime({ poule }: { poule: DetailedPouleInfo }) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('points')
  const [highlightedSeries, setHighlightedSeries] = useState<SeriesId | undefined>(undefined)

  if (!poule.showData) return null

  const range = getRangeForMetric(poule, selectedMetric)
  const domain = getDomainForMetric(poule, selectedMetric)

  const pouleInOneDay = dayjs(poule.timePoints[0]).isSame(dayjs(poule.timePoints[poule.timePoints.length - 1]), 'day')

  const formatTimePoint = (value: number) => {
    if (pouleInOneDay) {
      return dayjs(value).format('HH:mm')
    }
    return dayjs(value).format('DD-MM-YYYY')
  }

  return (
    <>
      <ButtonGroup className="select-metric-button-group">
        <Button variant={selectedMetric === 'points' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('points')}>Punten</Button>
        <Button variant={selectedMetric === 'position' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('position')}>Positie</Button>
        <Button variant={selectedMetric === 'strength' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('strength')}>Kracht</Button>
      </ButtonGroup>
      <LineChart
        colors={getColors(COLORS, highlightedSeries, poule.teams)}
        height={400}
        xAxis={[{ data: poule.timePoints, valueFormatter: formatTimePoint, label: pouleInOneDay ? 'Tijd' : 'Datum', min: domain[0], max: domain[1] }]}
        series={generateSeries(poule, selectedMetric)}
        yAxis={[{ reverse: selectedMetric === 'position', min: range[0], max: range[1], width: 40, tickNumber: getTickNumber(selectedMetric, poule) }]}
        slots={{
          legend: () => <CustomLegend highlightedSeries={highlightedSeries} setHighlightedSeries={setHighlightedSeries} />,
        }}

      >
        <Background />
        <ChartsGrid vertical horizontal />
        <LinePlot
          slotProps={{
            line: { strokeWidth: getStrokeWidth(selectedMetric) },
          }}
        />
        <ChartsXAxis />
        <ChartsYAxis />
      </LineChart>
    </>
  )
}

function Background() {
  const drawingArea = useDrawingArea()
  return (
    <rect
      x={drawingArea.left}
      y={drawingArea.top}
      width={drawingArea.width}
      height={drawingArea.height}
      fill="var(--color-background)"
    />
  )
}

function getColors(initialColors: string[], highlightedSeries: SeriesId | undefined, teams: Team[]) {
  if (highlightedSeries === undefined) {
    return initialColors
  }
  const sortedTeams = teams.slice().sort((a, b) => a.positie - b.positie)
  const highlightedSeriesIndex = sortedTeams.findIndex(team => team.team === highlightedSeries)
  return initialColors.map((color, index) => index === highlightedSeriesIndex ? color : color + '33')
}

function getRangeForMetric(poule: DetailedPouleInfo, metric: Metric) {
  if (metric === 'position') {
    return [0.5, poule.teams.length + 0.5]
  }
  else if (metric === 'points') {
    const maxPoints = Math.max(...poule.teams.map((team) => {
      return Math.max(...poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team].points))
    }))
    return [-0.5, maxPoints + 0.5]
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
  return [0, 0]
}

function getDomainForMetric(poule: DetailedPouleInfo, metric: Metric) {
  if (metric === 'position') {
    return [poule.timePoints[1], poule.timePoints[poule.timePoints.length - 1]]
  }
  else {
    return [poule.timePoints[0], poule.timePoints[poule.timePoints.length - 1]]
  }
}

function getStrokeWidth(metric: Metric) {
  if (metric === 'position') {
    return 15
  }
  return 3
}

function getTickNumber(metric: Metric, poule: DetailedPouleInfo) {
  if (metric === 'position') {
    return poule.teams.length
  }
  return undefined
}

function generateSeries(poule: DetailedPouleInfo, metric: Metric) {
  return poule.teams.slice().sort((a, b) => a.positie - b.positie).map(team => ({
    id: team.team,
    data: poule.dataAtTimePoints.map(dataPoint => dataPoint[team.team][metric]),
    label: team.omschrijving,
    curve: 'linear' as CurveType,
    showMark: false,
  }))
}
