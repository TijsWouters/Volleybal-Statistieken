import React from 'react'
import { BottomNavigation as MUIBottomNavigation, Paper } from '@mui/material'

export default function BottomNavigation({ children, bottomNavigationValue }: { children: React.ReactNode, bottomNavigationValue: number }) {
  const highlightWidth = `${100 / React.Children.count(children)}%`
  const highlightTransform = `translateX(${(bottomNavigationValue - 1) * 100}%) scale(1)`

  return (
    <Paper elevation={3} className="ignore-transition w-[calc(100%-16px)] bg-primary text-white max-w-2xl z-10 rounded-4xl sticky bottom-2 p-2 flex justify-center dark:bg-black">
      <MUIBottomNavigation
        showLabels
        value={bottomNavigationValue}
        className="w-full max-w-2xl rounded-4xl relative"
      >
        <div
          className="absolute top-0 left-0 bg-accent h-full rounded-4xl transition-transform duration-300 z-0"
          style={{ width: highlightWidth, transform: highlightTransform }}
        />
        {children}
      </MUIBottomNavigation>
    </Paper>
  )
}
