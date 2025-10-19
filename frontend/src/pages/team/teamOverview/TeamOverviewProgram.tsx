import EventNoteIcon from '@mui/icons-material/EventNote'
import { Typography } from '@mui/material'

import Match from '@/components/Match'
import LinkWithIcon from '@/components/LinkWithIcon'
import { useContext } from 'react'
import { TeamContext } from '../TeamRoutes'
import type { Data } from '@/query'
import dayjs from 'dayjs'

export default function TeamOverviewProgram() {
  const data = useContext(TeamContext)

  const nextMatch = getNextMatch(data)

  // Handle no next match
  let daysToMatch = nextMatch ? dayjs(nextMatch?.datum).diff(dayjs(), 'day') : null

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/program`} icon={<EventNoteIcon fontSize="large" />} text="Programma" />
      <Typography variant="h6">Volgende wedstrijd {nextMatch ? `(in ${daysToMatch} dagen)` : ''}</Typography>
      {!nextMatch && <Typography variant="body1">Geen volgende wedstrijd gevonden</Typography>}
      {nextMatch && <Match match={nextMatch} teamName={data.fullTeamName} />}
    </>
  )
}

function getNextMatch(data: Data) {
  if (!data) return null
  const allMatches = data.poules.flatMap((poule) => poule.matches)
  const plannedMatches = allMatches.filter(m => m.status.waarde === 'gepland')
  const futureMatches = plannedMatches.filter((match) => new Date(match.datum) >= new Date())
  const futureMatchesForTeam = futureMatches.filter((match) => match.teams.some((team) => team.omschrijving === data.fullTeamName))
  const sortedFutureMatchesForTeam = futureMatchesForTeam.sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())
  return sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null
}
