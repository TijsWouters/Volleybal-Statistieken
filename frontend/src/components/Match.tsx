import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useParams, useNavigate } from 'react-router'
import PredictionsBarChart from '@/components/PredictionsBarChart'

export default function Match({ match, teamName, result = false, withPredictionOrSets = true }: { match: Match, teamName: string, result?: boolean, withPredictionOrSets?: boolean }) {
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

  function handleClick() {
    navigate(`/team/${clubId}/${teamType}/${teamId}/match/${match.uuid}`)
  }

  return (
    <div className="match" key={match.uuid} onClick={handleClick}>
      <Typography align="center" variant="h6" className="date">{formattedDate}</Typography>
      <Typography align="center" variant="subtitle1" className="poule">{match?.pouleName}</Typography>
      <div className="match-teams-and-result-or-time">
        <div className={`team-name-and-logo left-team ${teamSide === 'left' ? 'highlighted' : ''}`}>
          <Typography variant="h6" className="team-name">
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
          <Typography variant="h6" className="team-name">
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </div>
      {result && withPredictionOrSets && <SetStanden match={match} teamName={teamName} />}
      {!result && withPredictionOrSets && <PredictionsBarChart prediction={match.prediction!} teamSide={teamSide} />}
    </div>
  )
}

function SetStanden({ match, teamName }: { match: Match, teamName: string }) {
  return (
    <div className="sets-container">
      {match?.setstanden?.map((set) => {
        let teamIndex, neutral
        if (match.teams[0].omschrijving === teamName) teamIndex = 'puntenA'
        if (match.teams[1].omschrijving === teamName) teamIndex = 'puntenB'
        if (!teamIndex) neutral = true
        const otherTeamIndex = teamIndex === 'puntenB' ? 'puntenA' : 'puntenB'

        return (
          <div key={set.set} className={`set ${neutral ? '' : (set[teamIndex!] > set[otherTeamIndex!] ? 'won' : 'lost')}`}>
            <Typography
              variant="body1"
              className="match-set"
            >
              {set.puntenA > set.puntenB ? <u>{set.puntenA}</u> : set.puntenA}
              {' '}
              -
              {' '}
              {set.puntenB > set.puntenA ? <u>{set.puntenB}</u> : set.puntenB}
            </Typography>
          </div>
        )
      })}
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
