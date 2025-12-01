import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'

type AccordionEntryProps = {
  title: string
  children: React.ReactNode
  IconComponent: any
}

export default function AccordionEntry({ title, children, IconComponent }: AccordionEntryProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const handleChange = (_event: React.SyntheticEvent, expanded: boolean) => {
    setIsOpen(expanded)
  }

  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const el = contentRef.current

    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect()

      const rootFontSize
        = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

      const topMarginPx = 9 * rootFontSize
      const bottomMarginPx = 1 * rootFontSize
      const footerHeightPx = 5 * rootFontSize

      const viewportHeight = window.innerHeight
      const effectiveViewportHeight = viewportHeight - footerHeightPx

      const contentHeight = rect.height

      // Case 1: content taller than effective viewport
      if (contentHeight + topMarginPx + bottomMarginPx > effectiveViewportHeight) {
        // ensure top is visible with top margin
        const deltaTop = rect.top - topMarginPx

        window.scrollBy({
          top: deltaTop,
          behavior: 'smooth',
        })
        return
      }

      // Case 2: content fits in viewport → ensure bottom + margin is visible
      const desiredBottom = rect.bottom + bottomMarginPx + footerHeightPx
      const hiddenAmount = desiredBottom - viewportHeight

      if (hiddenAmount > 0) {
        window.scrollBy({
          top: hiddenAmount,
          behavior: 'smooth',
        })
      }
      else {
        // If the bottom is fine but the top is too high up, gently adjust
        const deltaTop = rect.top - topMarginPx
        if (deltaTop < 0) {
          window.scrollBy({
            top: deltaTop,
            behavior: 'smooth',
          })
        }
      }
    }, 387)

    window.addEventListener('scroll', () => clearTimeout(timer), { once: true })

    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <Accordion className="w-full bg-panel pr-4 pl-4 pt-2 pb-2 rounded-none border-panel-border border-t" disableGutters expanded={isOpen} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon className="dark:text-white" />}>
        <div className="flex items-center gap-4">
          <IconComponent fontSize="large" className="text-accent" />
          <Typography variant="h6" fontWeight={600} className="dark:text-white">{title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails className="p-0" ref={contentRef}>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}
