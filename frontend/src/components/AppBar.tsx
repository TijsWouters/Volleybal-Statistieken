import { AppBar as MUIAppBar, Toolbar } from '@mui/material'

export default function AppBar({ children }: { children: React.ReactNode }) {
  return (
    <MUIAppBar
      className="ignore-transition"
      position="fixed"
      style={{ backgroundColor: 'var(--color-primary)', color: 'white', top: 0, zIndex: 10, height: '4rem', justifyContent: 'center',
        paddingLeft: '1rem', paddingRight: '1rem',
      }}
    >
      <Toolbar>{children}</Toolbar>
    </MUIAppBar>
  )
}
