import EventNoteIcon from '@mui/icons-material/EventNote'
import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { sortByDateAndTime } from '@/utils/sorting'

import Match from '@/components/Match'
import LinkWithIcon from '@/components/LinkWithIcon'
import { useTeamData, type Data } from '@/query'

export default function TeamOverviewProgram() {
  const { data } = useTeamData()
  if (!data) {
    return null
  }

  const nextMatch = getNextMatch(data)

  // Handle no next match
  const nextMatchDate = nextMatch ? dayjs(nextMatch.datum).startOf('day') : null
  const daysToMatch = nextMatch ? nextMatchDate?.diff(dayjs().startOf('day'), 'day') : null

  let nextMatchTitle = 'Volgende wedstrijd'
  if (daysToMatch === 0) {
    nextMatchTitle += ' (vandaag)'
  }
  else if (daysToMatch && daysToMatch === 1) {
    nextMatchTitle += ' (morgen)'
  }
  else if (daysToMatch && daysToMatch > 1) {
    nextMatchTitle += ` (in ${daysToMatch} dagen)`
  }

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/program`} icon={<EventNoteIcon fontSize="large" />} text="Programma" />
      <Typography variant="h6">
        {nextMatchTitle}
        :
      </Typography>
      {!nextMatch && <Typography variant="body1">Geen volgende wedstrijd gevonden</Typography>}
      {nextMatch && <Match match={nextMatch} teamName={data.fullTeamName} />}
    </>
  )
}

function getNextMatch(data: Data) {
  if (!data) return null
  const allMatches = data.poules.flatMap(poule => poule.matches)
  const plannedMatches = allMatches.filter(m => m.status.waarde === 'gepland')
  const futureMatchesForTeam = plannedMatches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  const sortedFutureMatchesForTeam = futureMatchesForTeam.sort(sortByDateAndTime)
  return sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null
}
