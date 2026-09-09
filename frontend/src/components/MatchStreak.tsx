import { sortByDateAndTime } from '@/utils/sorting'

export function MatchStreak({ teamName, matches }: { teamName: string, matches: Match[] }) {
  const sortedByData = matches.toSorted(sortByDateAndTime)

  return (
    <div className="flex flex-row w-full h-full gap-0.5">
      {sortedByData.map((match, index) => <StreakEntry key={index} teamName={teamName} match={match} />)}
    </div>
  )
}

function StreakEntry({ teamName, match }: { teamName: string, match: Match }) {
  let color: string
  let opacity: number

  if (!match.eindstand) {
    color = 'secondary'
    opacity = 0.3
  }
  else if (match.eindstand[0] === match.eindstand[1]) {
    color = 'secondary'
    opacity = 1
  }
  else {
    const teamIndex = match.teams.findIndex(team => team.omschrijving === teamName)
    const setsWon = match.eindstand[teamIndex]
    const totalSets = match.eindstand[0] + match.eindstand[1]
    const won = match.eindstand[teamIndex] > match.eindstand[1 - teamIndex]
    color = won ? 'green' : 'red'
    opacity = won ? setsWon / totalSets : 1 - (setsWon / totalSets)
  }

  return (
    <div
      className={`bg-${color} flex grow h-full rounded-md`}
      style={{ opacity: opacity }}
    >
    </div>
  )
}
