import { useState } from 'react'
import Github from '@mui/icons-material/GitHub'
import { Modal, Paper, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import CloseIcon from '@mui/icons-material/Close';

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
        <a href="#" onClick={handleOpenChangelog} style={{ cursor: 'pointer' }}>Changelog</a>
        <Divider />
        <span style={{ display: 'inline-block' }}>v1.1</span>
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
      <Paper elevation={4} className='modal'>
        <div className='sticky'>
          <Typography className="title" variant="h4" component="h2">
            Volleybal Statistieken Changelog
          </Typography>
          <CloseIcon className="close" onClick={() => setOpen(false)} />
        </div>
        <div className="content">
          <ReactMarkdown>{CHANGE_LOG_MARKDOWN}</ReactMarkdown>
        </div>
      </Paper>
    </Modal>
  )
}
