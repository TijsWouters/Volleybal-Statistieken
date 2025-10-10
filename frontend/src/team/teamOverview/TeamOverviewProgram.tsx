import EventNoteIcon from '@mui/icons-material/EventNote'
import { Typography } from '@mui/material'

import Match from '../../components/Match'
import LinkWithIcon from '../../components/LinkWithIcon'
import { useContext } from 'react'
import { TeamContext } from '../TeamRoutes'
import type { Data } from 'src/query'

export default function TeamOverviewProgram() {
  const data = useContext(TeamContext)

  const nextMatch = getNextMatch(data)


  // Handle no next match
  let btModelForPoule, pouleForNextMatch, pointMethod, prediction
  if (nextMatch) {
    btModelForPoule = data.bt[nextMatch.pouleName]
    pouleForNextMatch = data.poules.find((poule) => poule.name === nextMatch?.pouleName)
    pointMethod = pouleForNextMatch?.puntentelmethode
    prediction = btModelForPoule?.matchBreakdown(nextMatch?.teams[0].omschrijving, nextMatch?.teams[1].omschrijving, pointMethod)
  }

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/program`} icon={<EventNoteIcon fontSize="large" />} text="Programma" />
      <Typography variant="h6">Volgende wedstrijd</Typography>
      <Match match={nextMatch} prediction={prediction || null} />
    </>
  )
}

function getNextMatch(data: Data) {
  if (!data) return null
  const allMatches = data.poules.flatMap((poule) => poule.matches)
  const futureMatches = allMatches.filter(m => m.status.waarde === 'gepland')
  const futureMatchesForTeam = futureMatches.filter((match) => match.teams.some((team) => team.omschrijving === data.fullTeamName))
  const sortedFutureMatchesForTeam = futureMatchesForTeam.sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())
  return sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null
}
