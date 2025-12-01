import { AppBar as MUIAppBar, Toolbar } from '@mui/material'

export default function AppBar({ children }: { children: React.ReactNode }) {
  return (
    <MUIAppBar
      className="ignore-transition bg-primary text-white top-0 z-1100 h-16 justify-center dark:bg-black"
      position="fixed"
      style={{ viewTransitionName: 'app-bar' }}
    >
      <Toolbar>{children}</Toolbar>
    </MUIAppBar>
  )
}
