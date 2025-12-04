import { SportsVolleyball } from '@mui/icons-material'
import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'

type MatchProps = {
  match: Match
  teamName: string
  result?: boolean
  teamLinks?: boolean
  framed?: boolean
  inPanel?: boolean
}

export default function Match({ match, teamName, result = false, framed = true, inPanel = false }: MatchProps) {
  const { clubId, teamType, teamId } = useParams<{
    clubId: string
    teamType: string
    teamId: string
  }>()
  const navigate = useNavigate()

  const formattedDate = match.datum ? dayjs(match.datum).format('dddd D MMMM YYYY') : 'Datum onbekend'
  const formattedTime = match.tijdstip ? dayjs(match.tijdstip).format('H:mm') : 'N.T.B.'
  let neutral, teamDidWin
  if (match.teams[0].omschrijving === teamName && result) teamDidWin = match.eindstand ? match.eindstand[0] > match.eindstand[1] : undefined
  if (match.teams[1].omschrijving === teamName && result) teamDidWin = match.eindstand ? match.eindstand[1] > match.eindstand[0] : undefined
  if (teamDidWin === undefined) neutral = true

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    navigate(`/team/${clubId}/${teamType}/${teamId}/match/${match.uuid}`, { viewTransition: true })
  }

  function handleTeamClick(e: React.MouseEvent<HTMLSpanElement>, teamIndex: number) {
    e.stopPropagation()
    const team = match.teams[teamIndex]
    const parts = team.team.split('/')
    navigate(`/team/${parts[3]}/${parts[4]}/${parts[5]}/overview`, { viewTransition: true })
  }

  const viewName = `match-container-${match.uuid}`
  let containerClasses: string
  if (inPanel) {
    containerClasses = 'cursor-pointer py-1 max-w-4xl dark:text-white'
  }
  else if (framed) {
    containerClasses = 'bg-panel border border-panel-border rounded-[32px] p-2 cursor-pointer max-w-4xl'
  }
  else {
    containerClasses = 'p-4'
  }

  return (
    <div className={containerClasses} key={match.uuid} onClick={handleClick} style={{ viewTransitionName: viewName }}>
      <Typography align="center" variant="h5" fontSize={18} fontWeight={600} className="date">{formattedDate}</Typography>
      <Typography align="center" variant="h5" fontSize={16} fontWeight={300} className="leading-none">{match?.pouleName}</Typography>
      <div className="grid gap-2 items-center my-2 w-full justify-center justify-items-center grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex flex-col-reverse w-full h-full justify-end gap-1 md:grid md:grid-cols-2 md:items-center">
          <Typography variant="h6" className={`text-center wrap-break-word leading-[1.2] md:grow ${framed ? '' : 'cursor-pointer underline text-accent-dark dark:text-accent-light'}`} onClick={framed ? undefined : e => handleTeamClick(e, 0)} fontSize={18}>
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          className={`${'text-center p-[0.7rem] rounded-2xl font-bold text-white'} ${neutral ? 'bg-secondary' : (teamDidWin ? 'bg-green' : 'bg-red')}`}
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : formattedTime}
        </Typography>
        <div className="flex flex-col h-full w-full gap-1 md:flex-row md:grid md:grid-cols-2 md:items-center">
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className={`text-center wrap-break-word leading-[1.2] ${framed ? '' : 'cursor-pointer underline text-accent-dark dark:text-accent-light'}`} onClick={framed ? undefined : e => handleTeamClick(e, 1)} fontSize={18}>
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </div>
    </div>
  )
}

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  const [error, setError] = useState(false)

  return (
    !error
      ? (
          <img
            className="bg-white border-panel-border md:grow rounded-lg w-full aspect-4/2 object-contain p-1 border overflow-hidden"
            src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
            alt={`${match.teams[teamIndex].omschrijving}`}
            onError={() => setError(true)}
          />
        )
      : (
          <div className="border-panel-border md:grow rounded-lg w-full aspect-4/2 object-contain bg-white p-1 border overflow-hidden">
            <SportsVolleyball className="text-accent w-full h-full" />
          </div>
        )
  )
}

function getTeamImageURL(team: string) {
  const parts = team.split('/')
  const clubId = parts[3]
  return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`
}
