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
}

export default function Match({ match, teamName, result = false, framed = true }: MatchProps) {
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

  let teamSide: 'left' | 'right' | null = null
  if (match.teams[0].omschrijving === teamName) teamSide = 'left'
  if (match.teams[1].omschrijving === teamName) teamSide = 'right'

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

  const containerStyle = framed ? { backgroundColor: 'var(--color-panel)', border: '1px solid #ccc', borderRadius: '32px', padding: '0.5rem', cursor: 'pointer', viewTransitionName: `match-container-${match.uuid}` } : { padding: '1rem', viewTransitionName: `match-container-${match.uuid}` }

  return (
    <div style={containerStyle} className="match" key={match.uuid} onClick={handleClick}>
      <Typography align="center" variant="h5" fontSize={18} fontWeight={600} className="date">{formattedDate}</Typography>
      <Typography align="center" variant="h5" fontSize={16} fontWeight={300} className="poule">{match?.pouleName}</Typography>
      <div className="match-teams-and-result-or-time">
        <div className={`team-name-and-logo left-team ${teamSide === 'left' ? 'highlighted' : ''}`}>
          <Typography variant="h6" className="team-name" onClick={framed ? undefined : e => handleTeamClick(e, 0)} style={framed ? {} : { cursor: 'pointer', textDecoration: 'underline', color: 'var(--color-accent-dark)' }} fontSize={18}>
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          style={{ backgroundColor: neutral ? 'var(--color-secondary)' : (teamDidWin ? 'var(--color-green)' : 'var(--color-red)'), color: 'white', padding: '0.5rem 1rem', borderRadius: '16px' }}
          className={`match-result-or-time ${neutral ? 'neutral' : (teamDidWin ? 'won' : 'lost')}`}
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : formattedTime}
        </Typography>
        <div className={`team-name-and-logo right-team ${teamSide === 'right' ? 'highlighted' : ''}`}>
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className="team-name" onClick={framed ? undefined : e => handleTeamClick(e, 1)} style={framed ? {} : { cursor: 'pointer', textDecoration: 'underline', color: 'var(--color-accent-dark)' }} fontSize={18}>
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
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
            className="team-logo"
            src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
            alt={`${match.teams[teamIndex].omschrijving}`}
            onError={() => setError(true)}
          />
        )
      : (
          <div className="team-logo" style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
            <SportsVolleyball style={{ width: '100%', height: '100%', color: 'var(--color-accent)' }} />
          </div>
        )
  )
}

function getTeamImageURL(team: string) {
  const parts = team.split('/')
  const clubId = parts[3]
  return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`
}
