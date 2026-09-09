import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { MatchStreak } from '@/components/MatchStreak'

export function Streaks({ poule }: { poule: Poule }) {
  return (
    <Table className="streak-table">
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '1%', whiteSpace: 'nowrap' }}>Team</TableCell>
          <TableCell align="center" sx={{ width: '99%' }}>Reeks</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {poule.teams.map((team) => {
          const matches = poule.matches.filter(match => match.teams.some(matchTeam => matchTeam.omschrijving === team.omschrijving))
          return (
            <TableRow key={team.omschrijving}>
              <TableCell sx={{ width: '30%' }}>{team.omschrijving}</TableCell>
              <TableCell align="center" sx={{ width: '70%' }}>
                <div className="flex h-6 w-full">
                  <MatchStreak teamName={team.omschrijving} matches={matches} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
