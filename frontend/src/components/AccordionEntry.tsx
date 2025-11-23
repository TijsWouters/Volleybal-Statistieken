import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

type AccordionEntryProps = {
  title: string
  children: React.ReactNode
  IconComponent: any
}

export default function AccordionEntry({ title, children, IconComponent }: AccordionEntryProps) {
  return (
    <Accordion style={{ width: '100%', paddingRight: '1rem', paddingLeft: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderTop: '1px solid var(--color-primary)', borderBottom: '1px solid var(--color-primary)', borderRadius: 0 }} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <IconComponent fontSize="large" style={{ color: 'var(--color-accent)' }} />
          <Typography variant="h6" fontWeight={600} style={{ }}>{title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails style={{ padding: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}
