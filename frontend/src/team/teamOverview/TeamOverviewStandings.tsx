import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

import LinkWithIcon from '../../components/LinkWithIcon'
import { useContext, useEffect, useState } from 'react'
import { TeamContext } from '../TeamRoutes'

export default function TeamOverviewStandings() {
  const data = useContext(TeamContext)

  const poules = data.poules.toReversed()

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const useShort = screenWidth < 560;

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/standings`} icon={<EmojiEventsIcon fontSize="large" />} text="Standen" />
      <Table size='small' className="standings-table">
        <TableHead>
          <TableRow>
            <TableCell>Poule</TableCell>
            <TableCell>{useShort ? 'Pos.' : 'Positie'}</TableCell>
            <TableCell>{useShort ? 'Pun.' : 'Punten'}</TableCell>
            <TableCell>{useShort ? 'Gew.' : 'Gewonnen'}</TableCell>
            <TableCell>{useShort ? 'Verl.' : 'Verloren'}</TableCell>
            <TableCell>{useShort ? 'Wed.' : 'Wedstrijden'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {poules.map((poule) => (
            <TableRow key={poule.name}>
              <TableCell>{poule.name}</TableCell>
              <TableCell>{poule.positie ? poule.positie + 'e' : '-'}</TableCell>
              <TableCell>{poule.punten}</TableCell>
              <TableCell>{poule.wedstrijdenWinst}</TableCell>
              <TableCell>{poule.wedstrijdenVerlies}</TableCell>
              <TableCell>{poule.gespeeld}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
