import { Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { useTeamData, type Data } from '@/query'
import EventNoteIcon from '@mui/icons-material/EventNote'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import BarChartIcon from '@mui/icons-material/BarChart'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import type { ElementType } from 'react'

export default function TeamInfo() {
  const { data } = useTeamData()
  if (!data) {
    return null
  }

  const numberOfPlannedMatches = calculatePlannedMatches(data)
  const { pointsWon, pointsLost, setsWon, setsLost, won, lost, played } = calculatePlayedMatches(data)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <img
          src={`https://assets.nevobo.nl/organisatie/logo/${data.club.organisatiecode}.jpg`}
          alt={`Logo van ${data.club.naam}`}
          style={{ maxWidth: '100%' }}
          height={80}
        />
        <Typography variant="h5" fontWeight={600} fontSize={28}>
          {data.fullTeamName}
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '0.5rem', backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <LocationPinIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            {data.club.vestigingsplaats}
            ,
            {' '}
            {data.club.provincie}
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <SportsVolleyballIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            <Link component={RouterLink} to={`/club/${data.club.organisatiecode}`}>
              {data.club.naam}
            </Link>
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300}>
          <Stack direction="row" alignItems="center" gap={1}>
            <BarChartIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            {`${numberOfPlannedMatches} geplande wedstrijden`}
          </Stack>
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', width: '100%', marginBottom: '0.5rem' }}>
        <WinRateStat label="Wedstrijden" played={played} lost={lost} won={won} />
        <WinRateStat label="Sets" played={setsWon + setsLost} lost={setsLost} won={setsWon} />
        <WinRateStat label="Punten" played={pointsWon + pointsLost} lost={pointsLost} won={pointsWon} />
      </div>
      <QuickLink
        label="Volgende Wedstrijd"
        subtitle1="Over 13 dagen"
        subtitle2="Thuis tegen VC Sneek"
        IconComponent={EventNoteIcon}
        to="/wedstrijd/volgende"
        color={260}
      />
      <QuickLink
        label="Vorige Wedstrijd"
        subtitle1="14 dagen geleden"
        subtitle2="Uit tegen VC Sneek"
        IconComponent={BarChartIcon}
        to="/wedstrijd/vorige"
        color={260}
      />
      <QuickLink
        label="Competitie"
        subtitle1="Heren 1e Klasse C"
        subtitle2="3e plaats met 12 punten"
        IconComponent={EmojiEventsIcon}
        to="/competitie/overzicht"
        color={260}
      />
    </div>
  )
}

function WinRateStat({ label, played, lost, won }: { label: string, played: number, lost: number, won: number }) {
  return (
    <div style={{ width: '100%', backgroundColor: '#f9f9f9', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', flexGrow: 1 }}>
      <Typography variant="h6" fontWeight={500} fontSize={18}>{label}</Typography>
      <Typography variant="h6" fontWeight={400} fontSize={18}>{played}</Typography>
      <Typography variant="h6" fontWeight={300} fontSize={16}>
        {' '}
        (
        <span style={{ color: 'green' }}>
          {won}
        </span>
        /
        <span style={{ color: 'red' }}>
          {lost}
        </span>
        )
      </Typography>
    </div>
  )
}

function QuickLink({ label, subtitle1, subtitle2, IconComponent, to, color }: { label: string, subtitle1: string, subtitle2: string, IconComponent: ElementType, to: string, color: number }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <div style={{ width: '100%', borderRadius: '16px', padding: '0.5rem', backgroundColor: `hsl(${color}, 100%, 85%)`, display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', cursor: 'pointer' }} onClick={handleClick}>
      <IconComponent style={{ color: `hsl(${color}, 100%, 35%)`, fontSize: 60 }} />
      <div>
        <Typography variant="h5" fontSize={18} fontWeight={500} style={{ lineHeight: 1.2, textTransform: 'uppercase' }}>{label}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} style={{ lineHeight: 1.2 }}>{subtitle1}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} style={{ lineHeight: 1.2 }}>{subtitle2}</Typography>
      </div>
      <KeyboardArrowRightIcon style={{ color: `hsl(${color}, 100%, 35%)`, fontSize: 40, marginLeft: 'auto' }} />
    </div>
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
