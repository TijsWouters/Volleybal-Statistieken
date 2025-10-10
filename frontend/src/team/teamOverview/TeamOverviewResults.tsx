import EventAvailable from '@mui/icons-material/EventAvailable'
import Typography from '@mui/material/Typography'

import Match from '../../components/Match'
import LinkWithIcon from '../../components/LinkWithIcon'
import { useContext } from 'react'
import { TeamContext } from '../TeamRoutes'
import type { Data } from 'src/query'
import type { Match as MatchType } from 'types'

export default function TeamOverviewProgram() {
  const data = useContext(TeamContext)

  if (!data) return null

  const lastMatch = getLastMatch(data)

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/results`} icon={<EventAvailable fontSize="large" />} text="Uitslagen" />
      <Typography variant="h6">Vorige wedstrijd</Typography>
      <Match match={lastMatch} result prediction={null} />
    </>
  )
}

function getLastMatch(data: Data): MatchType | null {
  const allMatches = data?.poules.flatMap((poule) => poule.matches) || []
  const now = new Date()
  const pastMatches = allMatches.filter((match) => new Date(match.datum) < now && match.status.waarde === 'gespeeld')
  const pastMatchesForTeam = pastMatches.filter((match) => match.teams.some((team) => team.omschrijving === data.fullTeamName))
  const sortedPastMatchesForTeam = pastMatchesForTeam.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  return sortedPastMatchesForTeam.length > 0 ? sortedPastMatchesForTeam[0] : null
}
