// ViewportGate.tsx
import React from 'react'

import Loading from './Loading'

type ViewportGateProps = {
  children: React.ReactNode | (() => React.ReactNode)
  estimatedHeight?: number
  margin?: string
  once?: boolean
  keepMounted?: boolean
  placeholder?: React.ReactNode
  renderOnIdle?: boolean
  className?: string
  style?: React.CSSProperties
}

// Cross-browser rIC/cIC with Safari fallback
type IdleCb = (deadline: { didTimeout: boolean, timeRemaining: () => number }) => void

const hasRIC = typeof window !== 'undefined' && 'requestIdleCallback' in window

function rIC(cb: IdleCb): number {
  if (hasRIC) {
    return window.requestIdleCallback(cb)
  }
  // Fallback: run soon after frame; emulate ~50ms idle budget
  const start = performance.now()
  return window.setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (performance.now() - start)),
    })
  }, 0)
}

function cIC(id: number) {
  if (hasRIC) {
    return window.cancelIdleCallback(id)
  }
  clearTimeout(id)
}

export function ViewportGate({
  children,
  estimatedHeight = 0,
  margin = '400px 0px',
  once = true,
  keepMounted = true,
  renderOnIdle = false,
  className,
  style,
}: ViewportGateProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [isIntersecting, setIntersecting] = React.useState(false)
  const [hasShown, setHasShown] = React.useState(false)
  const [idleReady, setIdleReady] = React.useState(!renderOnIdle)

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return

    let idleId: number | null = null
    const io = new IntersectionObserver(
      ([entry]) => {
        const vis = !!entry.isIntersecting
        setIntersecting(vis)
        if (vis) {
          if (renderOnIdle && !idleReady) {
            idleId = rIC(() => setIdleReady(true))
          }
          if (once) setHasShown(true)
        }
        else if (!keepMounted && !once) {
          // If we unmount when offscreen and not "once", reset idle state
          setIdleReady(!renderOnIdle ? true : false)
        }
      },
      { root: null, rootMargin: margin },
    )

    io.observe(el)
    return () => {
      if (idleId != null) cIC(idleId)
      io.disconnect()
    }
  }, [margin, once, keepMounted, renderOnIdle])

  const shouldRender
    = (isIntersecting || (once && hasShown) || keepMounted) && idleReady

  const content
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    = typeof children === 'function' ? (children as Function)() : children

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        // Hint to the browser to skip off-screen work even before mount
        contentVisibility: shouldRender ? 'visible' : 'auto',
        containIntrinsicSize:
          !shouldRender && estimatedHeight ? `${estimatedHeight}px` : undefined,
      }}
    >
      {shouldRender
        ? content
        : <div style={{ height: estimatedHeight, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading /></div>}
    </div>
  )
}
