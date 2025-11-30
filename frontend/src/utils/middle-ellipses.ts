export function middleEllipses(text: string, maxLengthInPixels: number): string {
  const fontSize = 16
  const textWidth = measureText(text, fontSize)
  if (textWidth <= maxLengthInPixels) {
    return text
  }
  const lastTwoWords = text.split(' ').slice(-2).join(' ')
  const lastTwoWordsWidth = measureText(lastTwoWords, fontSize)
  if (lastTwoWordsWidth + measureText('...', fontSize) >= maxLengthInPixels) {
    // just show the last two words with ellipses
    return `...${lastTwoWords}`
  }
  let start = 0
  let end = text.length
  let trimmedText = text
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    const candidate = `${text.slice(0, mid)}...${lastTwoWords}`
    const candidateWidth = measureText(candidate, fontSize)
    if (candidateWidth > maxLengthInPixels) {
      end = mid - 1
    }
    else {
      trimmedText = candidate
      start = mid + 1
    }
  }
  return trimmedText.replace(/\s+$/, '')
}

export function measureText(string: string, fontSize = 10) {
  const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.02783203125, 0.334375, 0.409375, 0.7, 0.5, 0.9, 0.8, 0.2, 0.4, 0.5, 0.5, 0.7, 0.3, 0.4, 0.3, 0.5, 0.5, 0.5, 0.6, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.3, 0.3, 0.7, 0.7, 0.7, 0.5, 1, 0.9, 0.8, 0.7, 0.9, 0.8, 0.7, 0.8, 0.9, 0.5, 0.6, 0.9, 0.7109375, 1.1, 0.9, 0.8, 0.7, 0.8, 0.8, 0.6, 0.7, 0.9, 0.9, 1.1, 0.9, 0.8, 0.8, 0.4, 0.5, 0.334375, 0.6, 0.7, 0.334375, 0.5, 0.6, 0.5, 0.6, 0.5, 0.5, 0.7, 0.7, 0.3, 0.5, 0.7, 0.3, 0.9, 0.7, 0.5, 0.6, 0.6, 0.5, 0.4, 0.5, 0.7, 0.7, 0.9, 0.7, 0.7, 0.6, 0.5, 0.2015625, 0.5, 0.7]
  const avg = 0.6110824424342107
  return string
    .split('')
    .map((c: string) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
    .reduce((cur: any, acc: any) => acc + cur) * fontSize
}
