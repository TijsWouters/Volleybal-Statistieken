import { Paper, Typography } from '@mui/material'
import Match from '@/components/Match'

export default function PreviousEncounters({ match }: { match: DetailedMatchInfo }) {
  const previousEncounters = match.previousEncounters || []

  if (previousEncounters.length === 0) {
    return null
  }

  return (
    <Paper elevation={4}>
      <Typography variant="h4" component="h2">Vorige ontmoetingen</Typography>
      <hr />
      {previousEncounters.map(encounter => (
        <Match
          key={encounter.uuid}
          match={encounter}
          teamName={match.fullTeamName!}
          result={true}
        />
      ))}
    </Paper>
  )
}
