import { Link, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router'

export default function LinkWithIcon({ to, icon, text, variant = 'body1', sx }: { to: string, icon?: React.ReactNode, text: string, variant?: 'body1' | 'h4' | 'h6', sx?: object }) {
  return (
    <Link variant={variant} sx={{ display: 'block', ...sx, width: 'fit-content' }} component={RouterLink} to={to}>
      <Stack alignItems="center" direction="row" gap={1}>
        {icon}
        {text}
      </Stack>
    </Link>
  )
}
