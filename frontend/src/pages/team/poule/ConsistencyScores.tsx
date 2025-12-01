import { Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material'

export default function ConsistencyScores({ poule }: { poule: DetailedPouleInfo }) {
  if (!Object.values(poule.consistencyScores).some(score => score !== 1)) return null

  return (
    <Table className="consistency-scores-table">
      <TableHead>
        <TableRow>
          <TableCell>Team</TableCell>
          <TableCell align="center">Consistentiescore</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {poule.teams.slice().sort((a, b) => poule.consistencyScores[b.omschrijving] - poule.consistencyScores[a.omschrijving]).map(team => (
          <TableRow key={team.omschrijving}>
            <TableCell>{team.omschrijving}</TableCell>
            <TableCell align="center">{poule.consistencyScores[team.omschrijving] !== 1 ? poule.consistencyScores[team.omschrijving].toFixed(4) : '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
