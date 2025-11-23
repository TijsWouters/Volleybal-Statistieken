// --- Helpers ---
function hexToHsl(hex: string): { h: number, s: number, l: number } {
  hex = hex.replace('#', '')

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2

  let d = 0

  if (max === min) {
    h = 0 // achromatic
  }
  else {
    d = max - min
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }

  const s
    = max === min
      ? 0
      : l > 0.5
        ? d / (2 - max - min)
        : d / (max + min)

  return { h, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0]
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0]
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x]
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c]
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c]
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x]

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// --- Main interpolation ---
export function interpolateRedToGreen(
  t: number,
): string {
  const a = hexToHsl('#F44336') // red
  const b = hexToHsl('#4CAF50') // green

  // Hue interpolation with wrap-around (so 350° → 10° goes 20°, not 340°)
  let hDist = b.h - a.h
  if (Math.abs(hDist) > 180) {
    hDist -= Math.sign(hDist) * 360
  }
  const h = (a.h + hDist * t + 360) % 360

  const s = a.s + (b.s - a.s) * t
  const l = a.l + (b.l - a.l) * t

  return hslToHex(h, s, l)
}
