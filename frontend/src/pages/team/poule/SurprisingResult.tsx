import Match from '@/components/Match'

export default function SurprisingResult({ poule }: { poule: DetailedPouleInfo }) {
  const mostSurprisingResults = poule.mostSurprisingResults
  if (mostSurprisingResults.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {
        mostSurprisingResults.map(match => (<Match key={match.uuid} match={match} teamName={poule.fullTeamName} result />))
      }
    </div>
  )
}
