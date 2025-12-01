import Match from '@/components/Match'

export default function OtherEncounters({ match }: { match: DetailedMatchInfo }) {
  const otherEncounters = match.otherEncounters || []

  if (otherEncounters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-[1rem] w-full">
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
