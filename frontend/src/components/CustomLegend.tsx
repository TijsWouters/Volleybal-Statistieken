import { Typography } from '@mui/material'
import { useLegend } from '@mui/x-charts/hooks'
import { middleEllipses, measureText } from '@/utils/middle-ellipses'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type CustomLegendProps = {
  highlightedSeries?: string | number | undefined
  setHighlightedSeries?: ((s: string | number | undefined) => void) | undefined
  cutoffText?: boolean
  items?: { color: string, label: string, seriesId?: string | number }[]
}

const MIN_TEXT_WIDTH_PX = 145

export function CustomLegend(props: CustomLegendProps) {
  const { cutoffText = true } = props
  const highlightedSeries = 'highlightedSeries' in props ? props.highlightedSeries : undefined
  const setHighlightedSeries = 'setHighlightedSeries' in props ? props.setHighlightedSeries : undefined
  const { items: legendItems } = useLegend()

  const items = props.items ?? legendItems

  const containerRef = useRef<HTMLDivElement | null>(null)
  const longestLabelWidth = items.reduce((longest, item) => {
    return measureText(item.label, 16) > longest ? measureText(item.label, 16) : longest
  }, 0)
  const minimumTextWidth = cutoffText ? Math.min(longestLabelWidth, MIN_TEXT_WIDTH_PX) : longestLabelWidth
  const maxTextWidth = longestLabelWidth

  const [textWidth, setTextWidth] = useState<number>(computeTextWidth(window.innerWidth, items.length, minimumTextWidth, maxTextWidth))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextWidth(computeTextWidth(containerRef.current ? containerRef.current.clientWidth : window.innerWidth, items.length, minimumTextWidth, maxTextWidth))
    window.addEventListener('resize', () => {
      setTextWidth(computeTextWidth(containerRef.current ? containerRef.current.clientWidth : window.innerWidth, items.length, minimumTextWidth, maxTextWidth))
    })
    return () => {
      window.removeEventListener('resize', () => {
        setTextWidth(computeTextWidth(containerRef.current ? containerRef.current.clientWidth : window.innerWidth, items.length, minimumTextWidth, maxTextWidth))
      })
    }
  }, [])

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextWidth(computeTextWidth(containerRef.current ? containerRef.current.clientWidth : window.innerWidth, items.length, minimumTextWidth, maxTextWidth))
  }, [items.length, ...[...items.map(i => i.label)]])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', gap: '0 8px', flexWrap: 'wrap', width: 'calc(100dvw - 32px)', justifyContent: 'center' }}
      ref={containerRef}
    >
      {items.map(item => (
        <div
          key={item.label}
          onClick={() =>
            highlightedSeries === item.seriesId!
              ? setHighlightedSeries?.(undefined)
              : setHighlightedSeries?.(item.seriesId!)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: item.seriesId === highlightedSeries ? `${item.color}33` : 'transparent',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: item.color, width: 12, height: 12, borderRadius: 2 }} />
          <Typography sx={{ display: 'inline-block', width: `${textWidth}px`, fontSize: 16 }}>{cutoffText ? middleEllipses(item.label, textWidth) : item.label}</Typography>
        </div>
      ))}
    </div>
  )
}

const GAP_BETWEEN_ITEMS = 8
const EXTRA_ITEM_WIDTH = 12 + 4 // color box + gap

function computeTextWidth(containerWidth: number, numItems: number, minimumTextWidth: number, maximumTextWidth: number): number {
  const minItemWidth = minimumTextWidth + EXTRA_ITEM_WIDTH
  const maxItemsPerRow = Math.max(
    1,
    Math.floor((containerWidth + GAP_BETWEEN_ITEMS) / (minItemWidth + GAP_BETWEEN_ITEMS)),
  )
  const rows = Math.ceil(numItems / maxItemsPerRow)
  const itemsPerRow = Math.min(maxItemsPerRow, Math.ceil(numItems / rows))
  const totalGapsWidth = GAP_BETWEEN_ITEMS * (itemsPerRow - 1)
  const rowWidth = (containerWidth - totalGapsWidth) / itemsPerRow
  const textWidth = rowWidth - EXTRA_ITEM_WIDTH - 4

  return Math.floor(Math.min(textWidth, maximumTextWidth + 4))
}
