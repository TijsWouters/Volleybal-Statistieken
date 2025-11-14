import { Table, TableHead, TableBody, TableRow, TableCell, Link } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useContext, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'

import { TeamContext } from '../TeamRoutes'

import LinkWithIcon from '@/components/LinkWithIcon'

export default function TeamOverviewStandings() {
  const data = useContext(TeamContext)

  const poules = data.poules.slice().reverse()
  const poulesWithStandings = poules.filter(p => p.standberekening !== false)

  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const useShort = screenWidth < 560

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/standings`} icon={<EmojiEventsIcon fontSize="large" />} text="Standen" />
      <Table size="small" className="standings-table">
        <TableHead>
          <TableRow>
            <TableCell>Poule</TableCell>
            <TableCell align="center">{useShort ? 'Pos' : 'Positie'}</TableCell>
            <TableCell align="center">{useShort ? 'Ptn' : 'Punten'}</TableCell>
            <TableCell align="center">{useShort ? 'W' : 'Gewonnen'}</TableCell>
            <TableCell align="center">{useShort ? 'V' : 'Verloren'}</TableCell>
            <TableCell align="center">{useShort ? 'GS' : 'Gespeeld'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {poulesWithStandings.map(poule => (
            <TableRow key={poule.poule}>
              <TableCell><Link component={RouterLink} to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/poule?pouleId=${poule.poule}`}>{poule.name}</Link></TableCell>
              <TableCell align="center">{poule.positie ? poule.positie + 'e' : '-'}</TableCell>
              <TableCell align="center">{poule.punten}</TableCell>
              <TableCell align="center">{poule.wedstrijdenWinst}</TableCell>
              <TableCell align="center">{poule.wedstrijdenVerlies}</TableCell>
              <TableCell align="center">{poule.gespeeld}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
