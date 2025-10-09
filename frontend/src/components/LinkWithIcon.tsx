import { Link, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router'

export default function LinkWithIcon({ to, icon, text, variant = 'body1' }: { to: string, icon?: React.ReactNode, text: string, variant?: 'body1' | 'h4' | 'h6' }) {
  return (
    <Link variant={variant} sx={{ display: 'block' }} component={RouterLink} to={to}>
      <Stack alignItems="center" direction="row" gap={1}>
        {icon}
        {text}
      </Stack>
    </Link>
  )
}
