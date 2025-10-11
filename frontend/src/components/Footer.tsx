import { useState } from 'react'
import Github from '@mui/icons-material/GitHub'
import CoffeeIcon from '@mui/icons-material/Coffee'
import { Modal, Paper } from '@mui/material'
import ReactMarkdown from 'react-markdown'

import CHANGE_LOG_MARKDOWN from '../../../CHANGELOG.md?raw'

export default function Footer() {
  const [open, setOpen] = useState(false)

  function handleOpenChangelog(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    setOpen(true)
  }

  return (
    <>
      <footer style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ display: 'inline-block', margin: 0 }}>Gemaakt door Tijs</p>
        <Divider />
        <p style={{ display: 'inline-block', margin: 0 }}>
          Volleybal Statistieken maakt gebruik van data van de
          {' '}
          <a href="https://www.volleybal.nl/" target="_blank" rel="noopener noreferrer">Nevobo</a>
        </p>
        <Divider />
        <span style={{ verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <Github fontSize="small" />
          <a href="https://github.com/TijsWouters/VolleyStats" target="_blank" rel="noopener noreferrer">
            Bekijk de code op GitHub
          </a>
        </span>
        <Divider />
        <span style={{ verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <CoffeeIcon fontSize="small" />
          <a href="https://buymeacoffee.com/tijswouters" target="_blank" rel="noopener noreferrer">
            Steun de ontwikkelaar
          </a>
        </span>
        <Divider />
        <a href="#" onClick={handleOpenChangelog} style={{ cursor: 'pointer' }}>Changelog</a>
      </footer>
      <ChangelogModal open={open} setOpen={setOpen} />
    </>
  )
}

function Divider() {
  return (
    <span style={{ margin: '0 0.5rem' }}>|</span>
  )
}

function ChangelogModal({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
    >
      <Paper className='modal'>
        <ReactMarkdown>{CHANGE_LOG_MARKDOWN}</ReactMarkdown>
      </Paper>
    </Modal>
  )
}
