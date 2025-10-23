import EventAvailable from '@mui/icons-material/EventAvailable'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useContext } from 'react'

import { TeamContext } from '../TeamRoutes'

import LinkWithIcon from '@/components/LinkWithIcon'
import Match from '@/components/Match'
import type { Data } from '@/query'

export default function TeamOverviewProgram() {
  const data = useContext(TeamContext)

  const lastMatch = getLastMatch(data)
  const lastMatchDate = lastMatch ? dayjs(lastMatch.datum).startOf('day') : null
  const daysSinceLastMatch = lastMatch ? Math.abs(lastMatchDate!.diff(dayjs().startOf('day'), 'day')!) : null

  let lastMatchTitle = 'Vorige wedstrijd'
  if (daysSinceLastMatch === 0) {
    lastMatchTitle += ' (vandaag)'
  }
  else if (daysSinceLastMatch === 1) {
    lastMatchTitle += ' (gisteren)'
  }
  else if (daysSinceLastMatch && daysSinceLastMatch > 1) {
    lastMatchTitle += ` (${daysSinceLastMatch} dagen geleden)`
  }

  return (
    <>
      <LinkWithIcon variant="h4" to={`/team/${data.clubId}/${data.teamType}/${data.teamId}/results`} icon={<EventAvailable fontSize="large" />} text="Uitslagen" />
      <Typography variant="h6">
        {lastMatchTitle}
        :
      </Typography>
      {!lastMatch && <Typography variant="body1">Geen vorige wedstrijd gevonden</Typography>}
      {lastMatch && <Match match={lastMatch} result teamName={data.poules.find(p => p.name === lastMatch!.pouleName)!.omschrijving} />}
    </>
  )
}

function getLastMatch(data: Data): Match | null {
  const allMatches = data?.poules.flatMap(poule => poule.matches) || []
  const pastMatches = allMatches.filter(match => match.status.waarde === 'gespeeld')
  const pastMatchesForTeam = pastMatches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  const sortedPastMatchesForTeam = pastMatchesForTeam.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  return sortedPastMatchesForTeam.length > 0 ? sortedPastMatchesForTeam[0] : null
}
