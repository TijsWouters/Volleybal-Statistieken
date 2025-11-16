import { Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import LanguageIcon from '@mui/icons-material/Language'
import { useContext } from 'react'
import ShareButton from '@/components/ShareButton'

import { TeamContext } from '../TeamRoutes'

import BackLink from '@/components/BackLink'
import type { Data } from '@/query'
import FavouriteButton from '@/components/FavouriteButton'

export default function TeamInfo() {
  const data = useContext(TeamContext)

  const numberOfPlannedMatches = calculatePlannedMatches(data)
  const { pointsWon, pointsLost, setsWon, setsLost, won, lost, played } = calculatePlayedMatches(data)

  return (
    <>
      <BackLink to="/" text="Terug naar zoeken" />
      <Typography variant="h4">
        {data.fullTeamName}
      </Typography>
      <FavouriteButton
        title={data.fullTeamName}
        type="team"
      />
      <ShareButton summary={buildSummary(data)} />
      <img
        src={`https://assets.nevobo.nl/organisatie/logo/${data.club.organisatiecode}.jpg`}
        alt={`Logo van ${data.club.naam}`}
        style={{ maxWidth: '100%' }}
        height={80}
      />
      <hr />
      <Typography variant="h6" gutterBottom>
        <Stack direction="row" alignItems="center" gap={1}>
          <LocationPinIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
          {data.club.vestigingsplaats}
          ,
          {' '}
          {data.club.provincie}
        </Stack>
      </Typography>
      <Typography variant="h6" gutterBottom>
        <Stack direction="row" alignItems="center" gap={1}>
          <SportsVolleyballIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
          <Link component={RouterLink} to={`/club/${data.club.organisatiecode}`}>
            {data.club.naam}
          </Link>
        </Stack>
      </Typography>
      <Typography variant="h6" gutterBottom>
        <Stack direction="row" alignItems="center" gap={1}>
          <LanguageIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
          <Link component={RouterLink} to={data.club.website} target="_blank" rel="noopener noreferrer">{data.club.website.split('://')[1]}</Link>
        </Stack>
      </Typography>
      <hr />
      <Typography variant="h6" gutterBottom>
        Geplande wedstrijden:
        {' '}
        {numberOfPlannedMatches}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Gespeelde wedstrijden:
        {' '}
        {played}
        {' '}
        (
        <span style={{ color: 'darkgreen' }}>{won}</span>
        /
        <span style={{ color: 'darkred' }}>{lost}</span>
        )
      </Typography>
      <Typography variant="h6" gutterBottom>
        Gespeelde sets:
        {' '}
        {setsWon + setsLost}
        {' '}
        (
        <span style={{ color: 'darkgreen' }}>{setsWon}</span>
        /
        <span style={{ color: 'darkred' }}>{setsLost}</span>
        )
      </Typography>
      <Typography variant="h6" gutterBottom>
        Gespeelde punten:
        {' '}
        {pointsWon + pointsLost}
        {' '}
        (
        <span style={{ color: 'darkgreen' }}>{pointsWon}</span>
        /
        <span style={{ color: 'darkred' }}>{pointsLost}</span>
        )
      </Typography>
      <hr />
      <Typography variant="h6">
        Actief in:
      </Typography>

      <ul style={{ margin: 0 }}>
        {data.poules.slice().reverse().map(poule => (
          <li key={poule.poule}>
            {poule.standberekening
              ? (
                  <Link component={RouterLink} to={`poule?pouleId=${poule.poule}`}>
                    {poule.name}
                  </Link>
                )
              : poule.name}
          </li>
        ))}
      </ul>

    </>
  )
}

function buildSummary(data: Data) {
  const lines = [
    `👥 ${data.fullTeamName}`,
    `📍 ${data.club.vestigingsplaats}, ${data.club.provincie}`,
    (data.poules.length > 0 ? `🏆 ${data.poules[data.poules.length - 1].name}` : ''),
  ].join('\n')

  return {
    text: lines + '\n',
    url: window.location.href,
  }
}

function calculatePlannedMatches(data: Data) {
  if (!data) return 0
  const allMatches = data.poules.flatMap(poule => poule.matches)
  const plannedMatches = allMatches.filter(match => match.status.waarde !== 'gespeeld')
  const matchesForTeam = plannedMatches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  return matchesForTeam.length
}

function calculatePlayedMatches(data: Data): { pointsWon: number, pointsLost: number, setsWon: number, setsLost: number, won: number, lost: number, played: number } {
  let played = 0
  let won = 0
  let lost = 0
  let setsWon = 0
  let setsLost = 0
  let pointsWon = 0
  let pointsLost = 0

  for (const poule of data.poules) {
    for (const match of poule.matches) {
      if (match.status.waarde !== 'gespeeld') continue
      const teamIndex = match.teams.findIndex(team => team.omschrijving === data.fullTeamName)
      if (teamIndex === -1) continue
      played += 1
      const opponentIndex = teamIndex === 0 ? 1 : 0

      const teamSetsWon = match.eindstand![teamIndex]
      const opponentSetsWon = match.eindstand![opponentIndex]

      setsWon += teamSetsWon
      setsLost += opponentSetsWon

      if (teamSetsWon > opponentSetsWon) {
        won += 1
      }
      else {
        lost += 1
      }
      if (match.setstanden) {
        for (const setScore of match.setstanden) {
          pointsWon += (teamIndex === 0 ? setScore.puntenA : setScore.puntenB)
          pointsLost += (teamIndex === 0 ? setScore.puntenB : setScore.puntenA)
        }
      }
    }
  }

  return { pointsWon, pointsLost, setsWon, setsLost, won, lost, played }
}
