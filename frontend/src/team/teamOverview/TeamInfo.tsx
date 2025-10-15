import { Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import LanguageIcon from '@mui/icons-material/Language'

import BackLink from '../../components/BackLink'
import { useContext } from 'react'
import { TeamContext } from '../TeamRoutes'
import type { Data } from '../../query'

export default function TeamInfo() {
  const data = useContext(TeamContext)

  const numberOfPlannedMatches = calculatePlannedMatches(data)
  const { pointsWon, pointsLost, setsWon, setsLost, won, lost } = calculatePlayedMatches(data)

  return (
    <>
      <BackLink to="/" text="Terug naar zoeken" />
      <Typography variant="h4">
        {data.fullTeamName}
      </Typography>
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
          {data.club.naam}
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
        {won + lost}
        {' '}
        (
        <span style={{ color: 'green' }}>{won}</span>
        /
        <span style={{ color: 'red' }}>{lost}</span>
        )
      </Typography>
      <Typography variant="h6" gutterBottom>
        Gespeelde sets:
        {' '}
        {setsWon + setsLost}
        {' '}
        (
        <span style={{ color: 'green' }}>{setsWon}</span>
        /
        <span style={{ color: 'red' }}>{setsLost}</span>
        )
      </Typography>
      <Typography variant="h6" gutterBottom>
        Gespeelde punten:
        {' '}
        {pointsWon + pointsLost}
        {' '}
        (
        <span style={{ color: 'green' }}>{pointsWon}</span>
        /
        <span style={{ color: 'red' }}>{pointsLost}</span>
        )
      </Typography>
      <hr />
      <Typography variant="h6">
        Actief in:
      </Typography>

      <ul style={{ margin: 0 }}>
        {data.poules.map((poule) => (
          <li key={poule.name}>
            {poule.name}
          </li>
        ))}
      </ul>
      <img
        src={`https://assets.nevobo.nl/organisatie/logo/${data.club.organisatiecode}.jpg`}
        alt={`Logo van ${data.club.naam}`}
        style={{ width: '100%' }}
      />
    </>
  )
}

function calculatePlannedMatches(data: Data) {
  if (!data) return 0
  const allMatches = data.poules.flatMap((poule) => poule.matches)
  const plannedMatches = allMatches.filter((match) => match.status.waarde !== 'gespeeld')
  const matchesForTeam = plannedMatches.filter((match) => match.teams.some((team) => team.omschrijving === data.fullTeamName))
  return matchesForTeam.length
}

function calculatePlayedMatches(data: Data): { pointsWon: number, pointsLost: number, setsWon: number, setsLost: number, won: number, lost: number } {
  let won = 0
  let lost = 0
  let setsWon = 0
  let setsLost = 0
  let pointsWon = 0
  let pointsLost = 0

  for (const poule of data.poules) {
    won += poule.wedstrijdenWinst
    lost += poule.wedstrijdenVerlies
    setsWon += poule.setsVoor
    setsLost += poule.setsTegen
    pointsWon += poule.puntenVoor
    pointsLost += poule.puntenTegen
  }

  return { pointsWon, pointsLost, setsWon, setsLost, won, lost }
}
