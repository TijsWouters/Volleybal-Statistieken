import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useParams, useNavigate } from 'react-router'

export default function Match({ match, teamName, result = false, teamLinks = false, framed = true }: { match: Match, teamName: string, result?: boolean, withPredictionOrSets?: boolean, teamLinks?: boolean, framed?: boolean }) {
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
    navigate(`/team/${clubId}/${teamType}/${teamId}/match/${match.uuid}`)
  }

  function handleTeamClick(e: React.MouseEvent<HTMLSpanElement>, teamIndex: number) {
    e.stopPropagation()
    const team = match.teams[teamIndex]
    const parts = team.team.split('/')
    navigate(`/team/${parts[3]}/${parts[4]}/${parts[5]}`)
  }

  const containerStyle = framed ? { backgroundColor: '#f9f9f9', border: '1px solid #ccc', borderRadius: '16px', padding: '0.5rem' } : { padding: '1rem' }

  return (
    <div style={containerStyle} className="match" key={match.uuid} onClick={handleClick}>
      <Typography align="center" variant="h5" fontSize={18} fontWeight={600} className="date">{formattedDate}</Typography>
      <Typography align="center" variant="h5" fontSize={16} fontWeight={300} className="poule">{match?.pouleName}</Typography>
      <div className="match-teams-and-result-or-time">
        <div className={`team-name-and-logo left-team ${teamSide === 'left' ? 'highlighted' : ''}`}>
          <Typography variant="h6" className="team-name" onClick={teamLinks ? e => handleTeamClick(e, 0) : undefined} style={teamLinks ? { cursor: 'pointer', textDecoration: 'underline' } : {}} fontSize={18}>
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          style={{ backgroundColor: neutral ? 'hsl(260, 100%, 25%)' : (teamDidWin ? 'hsl(120, 100%, 25%)' : 'hsl(0, 100%, 25%)'), color: 'white', padding: '0.5rem 1rem', borderRadius: '16px' }}
          className={`match-result-or-time ${neutral ? 'neutral' : (teamDidWin ? 'won' : 'lost')}`}
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : formattedTime}
        </Typography>
        <div className={`team-name-and-logo right-team ${teamSide === 'right' ? 'highlighted' : ''}`}>
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className="team-name" onClick={teamLinks ? e => handleTeamClick(e, 1) : undefined} style={teamLinks ? { cursor: 'pointer', textDecoration: 'underline' } : {}} fontSize={18}>
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </div>
    </div>
  )
}

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  return (
    <img
      style={{ border: '1px solid #ccc', borderRadius: '16px' }}
      className="team-logo"
      src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
      loading="lazy"
      alt={`${match.teams[teamIndex].omschrijving}`}
    />
  )
}

function getTeamImageURL(team: string) {
  const parts = team.split('/')
  const clubId = parts[3]
  return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`
}
