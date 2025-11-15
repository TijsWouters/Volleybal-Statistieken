import { BarChart, ChartsReferenceLine, type BarProps, useAnimateBar, type BarLabelProps } from '@mui/x-charts'
import { Typography, Paper, ButtonGroup, Button } from '@mui/material'
import { useState } from 'react'
import COLORS from '@/assets/colors.json'

type Metric = 'matchWinRate' | 'setWinRate' | 'pointWinRate'

export default function TeamWinRates({ poule }: { poule: DetailedPouleInfo }) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('matchWinRate')
  if (!poule.showData) return null

  const dataToDisplay = poule.teams.sort((a, b) => a.positie - b.positie)

  return (
    <Paper elevation={4}>
      <Typography variant="h4">Winstpercentages</Typography>
      <hr />
      <ButtonGroup className="select-metric-button-group">
        <Button variant={selectedMetric === 'matchWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('matchWinRate')}>Wedstrijden</Button>
        <Button variant={selectedMetric === 'setWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('setWinRate')}>Sets</Button>
        <Button variant={selectedMetric === 'pointWinRate' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('pointWinRate')}>Punten</Button>
      </ButtonGroup>
      <BarChart
        height={300}
        series={generateSeries(dataToDisplay, selectedMetric)}
        yAxis={[{ position: 'none', min: 0, max: 100 }]}
        xAxis={[
          { data: [0], position: 'bottom', tickLabelInterval: () => false, categoryGapRatio: 0 },
        ]}
        barLabel={v => v.value?.toFixed(0) + '%' || ''}
        colors={COLORS}
        slots={{
          bar: BarShadedBackground,
          barLabel: VerticalBarLabel,
        }}
      >
        <ChartsReferenceLine
          y={100}
          lineStyle={{ strokeWidth: 1, strokeDasharray: '10 5', stroke: '#000' }}
        />
      </BarChart>
    </Paper>
  )
}

function BarShadedBackground(props: BarProps) {
  const { ownerState, ...otherProps } = props
  // Omit numeric `id` (SeriesId) coming from BarProps so SVG's id:string typing is satisfied
  const { ...other } = otherProps as any

  const animatedPropsRaw = useAnimateBar(props)
  // animatedProps may also contain an `id`; remove it as well
  const { ...animatedProps } = animatedPropsRaw as any

  return (
    <>
      <rect
        {...other}
        opacity={0.25}
        x={other.x}
        y={0}
        height="100%"
      />
      <rect
        {...other}
        filter={ownerState.isHighlighted ? 'brightness(120%)' : undefined}
        opacity={1}
        data-highlighted={ownerState.isHighlighted || undefined}
        data-faded={ownerState.isFaded || undefined}
        {...animatedProps}
      />
    </>
  )
}

function VerticalBarLabel(props: BarLabelProps) {
  const { x, yOrigin, width, children, ...otherProps } = props
  const { ...other } = otherProps as any
  const animatedPropsRaw = useAnimateBar(props)
  const { ...animatedProps } = animatedPropsRaw as any
  return (
    <g {...other} {...animatedProps}>
      <text
        x={x + width / 2}
        y={yOrigin / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(-90, ${x + width / 2}, ${yOrigin / 2})`}
        style={{ pointerEvents: 'none', fontSize: 14, fontWeight: 'bold', fill: '#000' }}
      >
        {children}
      </text>
    </g>
  )
}

function generateSeries(teams: DetailedTeamInfo[], dataKey: Metric) {
  return teams.map((t) => {
    return { data: [t[dataKey] * 100], label: t.omschrijving, valueFormatter: (v: number | null) => v!.toFixed(2) + '%' }
  })
}
