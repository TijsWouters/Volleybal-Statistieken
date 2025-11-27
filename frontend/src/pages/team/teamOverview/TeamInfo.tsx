import { Link, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { useTeamData, type Data } from '@/query'
import EventNoteIcon from '@mui/icons-material/EventNote'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import BarChartIcon from '@mui/icons-material/BarChart'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import type { ElementType } from 'react'
import dayjs from 'dayjs'
import { sortByDateAndTime } from '@/utils/sorting'

export default function TeamInfo() {
  const { data } = useTeamData()
  if (!data) {
    return null
  }

  const nextMatch = getNextMatch(data)
  const lastMatch = getLastMatch(data)
  const primaryPoule = getPrimaryPoule(data)

  const numberOfPlannedMatches = calculatePlannedMatches(data)
  const { pointsWon, pointsLost, setsWon, setsLost, won, lost, played } = calculatePlayedMatches(data)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
        <img
          src={`https://assets.nevobo.nl/organisatie/logo/${data.club.organisatiecode}.jpg`}
          alt={`Logo van ${data.club.naam}`}
          style={{ maxWidth: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '16px', backgroundColor: 'var(--color-panel)' }}
          height={100}
        />
        <Typography variant="h5" fontWeight={600} fontSize={28}>
          {data.fullTeamName}
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '0.5rem', backgroundColor: 'var(--color-panel)' }}>
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
            <Link component={RouterLink} to={`/club/${data.club.organisatiecode}/overview`}>
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
      {nextMatch && (
        <QuickLink
          label="Volgende Wedstrijd"
          subtitle1={nextMatch.subtitle1}
          subtitle2={nextMatch.subtitle2}
          IconComponent={EventNoteIcon}
          to={nextMatch.to}
          color={260}
        />
      )}
      {lastMatch && (
        <QuickLink
          label="Vorige Wedstrijd"
          subtitle1={lastMatch.subtitle1}
          subtitle2={lastMatch.subtitle2}
          IconComponent={BarChartIcon}
          to={lastMatch.to}
          color={260}
        />
      )}
      {primaryPoule && (
        <QuickLink
          label="Competitie"
          subtitle1={primaryPoule.subtitle1}
          subtitle2={primaryPoule.subtitle2}
          IconComponent={EmojiEventsIcon}
          to={primaryPoule.to}
          color={260}
        />
      )}
    </div>
  )
}

function WinRateStat({ label, played, lost, won }: { label: string, played: number, lost: number, won: number }) {
  return (
    <div style={{ width: '100%', backgroundColor: 'var(--color-panel)', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', flexGrow: 1 }}>
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

function QuickLink({ label, subtitle1, subtitle2, IconComponent, to }: { label: string, subtitle1: string, subtitle2: string, IconComponent: ElementType, to: string, color: number }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <Paper elevation={4} style={{ width: '100%', borderRadius: '16px', padding: '0.5rem', backgroundColor: 'var(--color-accent)', display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
      <IconComponent style={{ color: 'white', fontSize: 50 }} />
      <div>
        <Typography variant="h5" fontSize={18} fontWeight={500} style={{ lineHeight: 1.2, textTransform: 'uppercase', color: 'white' }}>{label}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} style={{ lineHeight: 1.2, color: 'white' }}>{subtitle1}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} style={{ lineHeight: 1.2, color: 'white' }}>{subtitle2}</Typography>
      </div>
      <KeyboardArrowRightIcon style={{ color: 'white', fontSize: 40, marginLeft: 'auto' }} />
    </Paper>
  )
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

type QuickLinkData = {
  subtitle1: string
  subtitle2: string
  to: string
}

function getNextMatch(data: Data): QuickLinkData | null {
  if (!data) return null
  const allMatches = data.poules.flatMap(poule => poule.matches)
  const plannedMatches = allMatches.filter(m => m.status.waarde === 'gepland')
  const futureMatchesForTeam = plannedMatches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  const sortedFutureMatchesForTeam = futureMatchesForTeam.sort(sortByDateAndTime)
  const match = sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null
  if (!match) return null
  const days = dayjs(match.datum).diff(dayjs().startOf('day'), 'day')
  let daysText = ''
  if (days === 0) {
    daysText = 'Vandaag'
  }
  else if (days === 1) {
    daysText = 'Morgen'
  }
  else if (days && days > 1) {
    daysText = `Over ${days} dagen`
  }

  let opponentTitle
  if (data.fullTeamName === match.teams[0].omschrijving) {
    opponentTitle = `Thuis tegen ${match.teams[1].omschrijving}`
  }
  else {
    opponentTitle = `Uit tegen ${match.teams[0].omschrijving}`
  }

  return {
    subtitle1: daysText,
    subtitle2: opponentTitle,
    to: `/team/${data.clubId}/${data.teamType}/${data.teamId}/match/${match.uuid}`,
  }
}

function getLastMatch(data: Data): QuickLinkData | null {
  const allMatches = data?.poules.flatMap(poule => poule.matches) || []
  const pastMatches = allMatches.filter(match => match.status.waarde === 'gespeeld')
  const pastMatchesForTeam = pastMatches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  const sortedPastMatchesForTeam = pastMatchesForTeam.sort(sortByDateAndTime).reverse()
  const match = sortedPastMatchesForTeam.length > 0 ? sortedPastMatchesForTeam[0] : null
  if (!match) return null
  const daysSince = dayjs().startOf('day').diff(dayjs(match.datum).startOf('day'), 'day')
  let daysText = ''
  if (daysSince === 0) {
    daysText = 'Vandaag'
  }
  else if (daysSince === 1) {
    daysText = 'Gisteren'
  }
  else if (daysSince && daysSince > 1) {
    daysText = `${daysSince} Dagen geleden`
  }

  let opponentTitle
  if (data.fullTeamName === match.teams[0].omschrijving) {
    opponentTitle = `Thuis tegen ${match.teams[1].omschrijving}`
  }
  else {
    opponentTitle = `Uit tegen ${match.teams[0].omschrijving}`
  }

  return {
    subtitle1: daysText,
    subtitle2: opponentTitle,
    to: `/team/${data.clubId}/${data.teamType}/${data.teamId}/match/${match.uuid}`,
  }
}

function getPrimaryPoule(data: Data): QuickLinkData | null {
  if (data.poules?.length === 0) return null
  const primaryPoule = data.poules[data.poules.length - 1]

  return {
    subtitle1: primaryPoule.name,
    subtitle2: `${primaryPoule.positie}e plaats met ${primaryPoule.punten} punten`,
    to: `/team/${data.clubId}/${data.teamType}/${data.teamId}/poule?pouleId=${primaryPoule.poule}`,
  }
}
