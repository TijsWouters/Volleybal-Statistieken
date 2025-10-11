import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

import LinkWithIcon from '../../components/LinkWithIcon'
import { useContext } from 'react'
import { TeamContext } from '../TeamRoutes'

export default function TeamOverviewStandings() {
  const data = useContext(TeamContext)

  const poules = data.poules.toReversed()

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/standings`} icon={<EmojiEventsIcon fontSize="large" />} text="Standen" />
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Poule</TableCell>
            <TableCell>Positie</TableCell>
            <TableCell>Punten</TableCell>
            <TableCell>Gewonnen</TableCell>
            <TableCell>Verloren</TableCell>
            <TableCell>Gespeeld</TableCell>
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
