import Match from '@/components/Match'
import { Paper, Typography } from '@mui/material'

export default function SurprisingResult({ poule }: { poule: DetailedPouleInfo }) {
  const mostSurprisingResults = poule.mostSurprisingResults
  if (mostSurprisingResults.length === 0) {
    return null
  }
  // Component implementation
  return (
    <Paper elevation={4} className="most-surprising-results-paper">
      <Typography variant="h4">Meest verrassende resultaten</Typography>
      <hr />
      <div className="most-surprising-results">
        {
          mostSurprisingResults.map(match => (<Match key={match.uuid} match={match} teamName={poule.fullTeamName} result />))
        }
      </div>
    </Paper>
  )
}
