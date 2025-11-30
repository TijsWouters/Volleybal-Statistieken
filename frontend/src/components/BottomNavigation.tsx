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
    <Paper elevation={3} style={{ width: 'calc(100% - 16px)', backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '40rem', zIndex: 10, borderRadius: '2rem', position: 'sticky', bottom: 8, padding: '0.5rem', display: 'flex', justifyContent: 'center' }} className="ignore-transition">
      <MUIBottomNavigation
        showLabels
        value={bottomNavigationValue}
        style={{ position: 'relative', width: '100%',
        }}
      >
        <div style={bottomNavigationHighlightStyle as any}></div>
        {children}
      </MUIBottomNavigation>
    </Paper>
  )
}
