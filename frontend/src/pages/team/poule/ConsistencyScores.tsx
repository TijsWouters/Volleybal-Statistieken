import { Paper, Typography, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material'

export default function ConsistencyScores({ poule }: { poule: DetailedPouleInfo }) {
  console.log('Consistency Scores:', poule.consistencyScores)
  return (
    <Paper elevation={4}>
      <Typography variant="h4">Consistentiescores</Typography>
      <hr />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Team</TableCell>
            <TableCell align="center">Consistentiescore</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {poule.teams.sort((a, b) => poule.consistencyScores[b.omschrijving] - poule.consistencyScores[a.omschrijving]).map(team => (
            <TableRow key={team.omschrijving}>
              <TableCell>{team.omschrijving}</TableCell>
              <TableCell align="center">{poule.consistencyScores[team.omschrijving]?.toFixed(4) ?? 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
