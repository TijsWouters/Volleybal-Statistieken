// ViewportGate.tsx
import React from "react";

type ViewportGateProps = {
  /** Rendered when in/near viewport. Can be a node or a function (to defer work). */
  children: React.ReactNode | (() => React.ReactNode);
  /** Pre-allocated height to avoid layout shift while not visible (px). */
  estimatedHeight?: number;            // e.g. 96
  /** Root margin for when to consider "visible". */
  margin?: string;                     // e.g. "400px 0px"
  /** If true, render once and keep mounted afterward. */
  once?: boolean;                      // default: true
  /** If true, keep mounted even after leaving viewport; if false, unmount when off-screen. */
  keepMounted?: boolean;               // default: true
  /** Optional placeholder to show before visibility; overrides estimatedHeight spacer. */
  placeholder?: React.ReactNode;
  /** If true, after becoming visible wait for an idle slot before rendering children. */
  renderOnIdle?: boolean;              // default: false
  className?: string;
  style?: React.CSSProperties;
};

const rIC =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (window.requestIdleCallback as (cb: IdleRequestCallback) => number)
    : (cb: Function) => window.setTimeout(cb as any, 0);

export function ViewportGate({
  children,
  estimatedHeight = 0,
  margin = "400px 0px",
  once = true,
  keepMounted = true,
  placeholder,
  renderOnIdle = false,
  className,
  style,
}: ViewportGateProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIntersecting] = React.useState(false);
  const [hasShown, setHasShown] = React.useState(false);
  const [idleReady, setIdleReady] = React.useState(!renderOnIdle);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let idleId: number | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        const vis = !!entry.isIntersecting;
        setIntersecting(vis);
        if (vis) {
          if (renderOnIdle && !idleReady) {
            idleId = rIC(() => setIdleReady(true));
          }
          if (once) setHasShown(true);
        }
      },
      { root: null, rootMargin: margin }
    );

    io.observe(el);
    return () => {
      if (idleId != null) cancelIdleCallback?.(idleId as any);
      io.disconnect();
    };
  }, [margin, once, renderOnIdle, idleReady]);

  const shouldRender =
    (isIntersecting || (once && hasShown) || keepMounted) && idleReady;

  const content =
    typeof children === "function" ? (children as Function)() : children;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        // Hint to the browser to skip off-screen work even before mount
        contentVisibility: shouldRender ? "visible" : "auto",
        containIntrinsicSize:
          !shouldRender && estimatedHeight ? `${estimatedHeight}px` : undefined,
      }}
    >
      {shouldRender
        ? content
        : placeholder ?? (estimatedHeight ? <div style={{ height: estimatedHeight }} /> : null)}
    </div>
  );
}
