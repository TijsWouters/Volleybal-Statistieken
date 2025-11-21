import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AccordionEntry({ title, children, IconComponent }: { title: string, children: React.ReactNode, IconComponent: any }) {
  return (
    <Accordion style={{ width: '100%', paddingRight: '1rem', paddingLeft: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconComponent fontSize="large" style={{ color: 'var(--color-primary)' }} />
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails style={{ padding: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}