import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useParams, useNavigate } from 'react-router'
import PredictionsBarChart from '@/components/PredictionsBarChart'
import SetResults from '@/components/SetResults'

export default function Match({ match, teamName, result = false, withPredictionOrSets = true, teamLinks = false }: { match: Match, teamName: string, result?: boolean, withPredictionOrSets?: boolean, teamLinks?: boolean }) {
  const { clubId, teamType, teamId } = useParams<{
    clubId: string
    teamType: string
    teamId: string
  }>()
  const navigate = useNavigate()

  const formattedDate = dayjs(match.datum).format('dddd D MMMM YYYY')
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

  return (
    <div className="match" key={match.uuid} onClick={handleClick}>
      <Typography align="center" variant="h6" className="date">{formattedDate}</Typography>
      <Typography align="center" variant="subtitle1" className="poule">{match?.pouleName}</Typography>
      <div className="match-teams-and-result-or-time">
        <div className={`team-name-and-logo left-team ${teamSide === 'left' ? 'highlighted' : ''}`}>
          <Typography variant="h6" className="team-name" onClick={teamLinks ? e => handleTeamClick(e, 0) : undefined} style={teamLinks ? { cursor: 'pointer', textDecoration: 'underline' } : {}}>
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          className={`match-result-or-time ${neutral ? 'neutral' : (teamDidWin ? 'won' : 'lost')}`}
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : dayjs(match?.tijdstip, 'HH:mm').format('H:mm')}
        </Typography>
        <div className={`team-name-and-logo right-team ${teamSide === 'right' ? 'highlighted' : ''}`}>
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className="team-name" onClick={teamLinks ? e => handleTeamClick(e, 1) : undefined} style={teamLinks ? { cursor: 'pointer', textDecoration: 'underline' } : {}}>
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </div>
      {result && withPredictionOrSets && <SetResults match={match} teamName={teamName} />}
      {!result && withPredictionOrSets && <PredictionsBarChart prediction={match.prediction!} teamSide={teamSide} tooltip={false} />}
    </div>
  )
}

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  return (
    <img
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
