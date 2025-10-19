import { Paper, Typography, Button, Tabs, Tab } from '@mui/material'

import Search from './Search'
import Recent from './Recent'
import Favourites from './Favourites'
import Random from './Random'
import { useEffect, useState } from 'react'
import GroupsIcon from '@mui/icons-material/Groups';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestoreIcon from '@mui/icons-material/Restore';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import CasinoIcon from '@mui/icons-material/Casino';

import '@/styles/home.css'
import Nearby from './Nearby'

declare global {
  interface Window {
    deferredPWAInstallPrompt: any
    canInstallPWA: boolean
  }
}

const TAB_SCROLL_THRESHOLD = 600

const TeamSearch = () => <Search type="team" />
const ClubSearch = () => <Search type="club" />

export default function HomeScreen() {
  const [tabIndex, setTabIndex] = useState(0)
  const [fullWidth, setFullWidth] = useState(window.innerWidth > TAB_SCROLL_THRESHOLD)

  useEffect(() => {
    document.title = 'Volleybal Statistieken'
    function handleResize() {
      setFullWidth(window.innerWidth > TAB_SCROLL_THRESHOLD)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
  }, [window.canInstallPWA])
  
  return (
    <div className='home-screen-container'>
      <Typography className='title' variant="h1">
        VOLLEYBAL
        <br />
        STATISTIEKEN
      </Typography>
      <Button
        style={{ display: window.canInstallPWA ? 'block' : 'none' }}
        variant="contained"
        size="small"
        onClick={() => window.deferredPWAInstallPrompt().prompt()}
      >
        Download Volleybal Statistieken als app
      </Button>
      <Paper elevation={4} className="search">
        <Tabs
          className='tabs'
          value={tabIndex}
          variant={fullWidth ? "fullWidth" : "scrollable"}
          onChange={(_, newValue) => setTabIndex(newValue)}
          allowScrollButtonsMobile
          scrollButtons
        >
          <Tab icon={<GroupsIcon />} label="Teams" />
          <Tab icon={<SportsVolleyballIcon />} label="Clubs" />
          <Tab icon={<FavoriteIcon />} label="Favorieten" />
          <Tab icon={<RestoreIcon />} label="Recent" />
          <Tab icon={<LocationPinIcon />} label="In de buurt" />
          <Tab icon={<CasinoIcon />} label="Willekeurig" />
        </Tabs>
          <TabPanel value={tabIndex} index={0}>
            <TeamSearch />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <ClubSearch />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Favourites />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <Recent />
          </TabPanel>
          <TabPanel value={tabIndex} index={4}>
            <Nearby />
          </TabPanel>
          <TabPanel value={tabIndex} index={5}>
            <Random />
          </TabPanel>
      </Paper>
    </div>
  )
}

function TabPanel(props: { children: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props

  return (
    <div
      className="tab-panel"
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}
