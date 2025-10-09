import { useParams } from 'react-router'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

import { useTeamData } from '../../query'
import LinkWithIcon from '../../components/LinkWithIcon'

export default function TeamOverviewStandings() {
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>()

  const { data, isPending } = useTeamData(clubId!, teamType!, teamId!)

  if (isPending) {
    return <div>Loading...</div>
  }

  const poules = data.poules.toReversed()

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${clubId}/${teamType}/${teamId}/standings`} icon={<EmojiEventsIcon fontSize="large" />} text="Standen" />
      <Table>
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
          {poules.map((poule: any) => (
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
