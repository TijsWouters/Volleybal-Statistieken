import { Share } from '@mui/icons-material'
import { Button } from '@mui/material'

type Summary = {
  title?: string
  text?: string
  url?: string
}

export default function ShareButton({ summary }: { summary: Summary }) {
  if (!navigator.canShare || !navigator.canShare(summary)) {
    return null
  }

  return (
    <Button className="share-button" variant="outlined" color="primary" onClick={() => navigator.share(summary)}>
      <Share />
      <p>Delen</p>
    </Button>
  )
}
