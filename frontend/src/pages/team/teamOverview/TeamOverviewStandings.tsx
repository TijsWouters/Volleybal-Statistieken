import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useContext, useEffect, useState } from 'react'

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
            <TableCell align="center">{useShort ? 'Pos.' : 'Positie'}</TableCell>
            <TableCell align="center">{useShort ? 'Pun.' : 'Punten'}</TableCell>
            <TableCell align="center">{useShort ? 'Gew.' : 'Gewonnen'}</TableCell>
            <TableCell align="center">{useShort ? 'Verl.' : 'Verloren'}</TableCell>
            <TableCell align="center">{useShort ? 'Wed.' : 'Wedstrijden'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {poulesWithStandings.map(poule => (
            <TableRow key={poule.name}>
              <TableCell>{poule.name}</TableCell>
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
