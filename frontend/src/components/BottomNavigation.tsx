import React from 'react'
import { BottomNavigation as MUIBottomNavigation, Paper } from '@mui/material'

export default function BottomNavigation({ children, bottomNavigationValue }: { children: React.ReactNode, bottomNavigationValue: number }) {
  const bottomNavigationHighlightStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'var(--color-accent)',
    width: `${100 / React.Children.count(children)}%`,
    height: '100%',
    borderRadius: '2rem',
    transition: 'transform 0.3s ease',
    transform: `translateX(${(bottomNavigationValue - 1) * 100}%) scale(1)`,
    zIndex: 0,
  }

  return (
    <Paper elevation={3} style={{ width: '100%', backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '40rem', zIndex: 10, borderRadius: 0, position: 'sticky', bottom: 0, padding: '0.5rem' }} className="ignore-transition">
      <MUIBottomNavigation showLabels value={bottomNavigationValue} style={{ position: 'relative' }}>
        <div style={bottomNavigationHighlightStyle as any}></div>
        {children}
      </MUIBottomNavigation>
    </Paper>
  )
}
