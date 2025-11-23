import Match from '@/components/Match'

export default function OtherEncounters({ match }: { match: DetailedMatchInfo }) {
  const otherEncounters = match.otherEncounters || []

  if (otherEncounters.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {otherEncounters.map(encounter => (
        <Match
          key={encounter.uuid}
          match={encounter}
          teamName={match.fullTeamName!}
          result={encounter.status.waarde.toLowerCase() === 'gespeeld'}
        />
      ))}
    </div>
  )
}
