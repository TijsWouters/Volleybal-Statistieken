import { Paper, Typography } from '@mui/material'
import Match from '@/components/Match'

export default function OtherEncounters({ match }: { match: DetailedMatchInfo }) {
  const otherEncounters = match.otherEncounters || []

  if (otherEncounters.length === 0) {
    return null
  }

  return (
    <Paper elevation={4}>
      <Typography variant="h4" component="h2">Andere ontmoetingen</Typography>
      <hr />
      <div className="other-encounters">
        {otherEncounters.map(encounter => (
          <Match
            key={encounter.uuid}
            match={encounter}
            teamName={match.fullTeamName!}
            result={encounter.status.waarde.toLowerCase() === 'gespeeld'}
          />
        ))}
      </div>
    </Paper>
  )
}
