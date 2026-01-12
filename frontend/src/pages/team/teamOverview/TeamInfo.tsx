import { Link, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router'
import LocationPinIcon from '@mui/icons-material/LocationPin'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { useTeamData, type Data } from '@/query'
import EventNoteIcon from '@mui/icons-material/EventNote'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import BarChartIcon from '@mui/icons-material/BarChart'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useState, type ElementType } from 'react'
import dayjs from 'dayjs'
import { sortByDateAndTime } from '@/utils/sorting'

export default function TeamInfo() {
  const { data } = useTeamData()
  const [loadImageError, setLoadImageError] = useState(false)
  if (!data) {
    return null
  }

  const nextMatch = getNextMatch(data)
  const lastMatch = getLastMatch(data)
  const primaryPoule = getPrimaryPoule(data)

  const numberOfPlannedMatches = calculatePlannedMatches(data)
  const { pointsWon, pointsLost, setsWon, setsLost, won, lost, played } = calculatePlayedMatches(data)

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <div className="flex flex-col items-center w-full gap-2">
        {!loadImageError
          ? (
              <img
                src={`https://assets.nevobo.nl/organisatie/logo/${data.club.organisatiecode}.jpg`}
                alt={`Logo van ${data.club.naam}`}
                className="max-w-full p-2 border border-panel-border bg-white rounded-2xl aspect-4/2 object-contain h-[100px]"
                onError={() => setLoadImageError(true)}
              />
            )
          : (
              <div className="max-w-full p-2 border border-panel-border bg-white rounded-2xl aspect-4/2 object-contain h-[100px]">
                <SportsVolleyballIcon className="w-full h-full text-accent" />
              </div>
            )}
        <Typography variant="h5" fontWeight={600} fontSize={28} textAlign="center">
          {data.fullTeamName}
        </Typography>
      </div>
      <div className="flex flex-col w-full items-center border border-panel-border rounded-lg p-2 bg-panel">
        <Typography variant="h6" fontWeight={300} className="text-center">
          <Stack direction="row" alignItems="center" gap={1}>
            <LocationPinIcon fontSize="medium" className="align-middle" />
            {data.club.vestigingsplaats}
            ,
            {' '}
            {data.club.provincie}
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300} className="text-center">
          <Stack direction="row" alignItems="center" gap={1}>
            <SportsVolleyballIcon fontSize="medium" className="align-middle" />
            <Link component={RouterLink} to={`/club/${data.club.organisatiecode}/overview`} viewTransition>
              {data.club.naam}
            </Link>
          </Stack>
        </Typography>
        <Typography variant="h6" fontWeight={300} className="text-center">
          <Stack direction="row" alignItems="center" gap={1}>
            <BarChartIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            {`${numberOfPlannedMatches} geplande wedstrijden`}
          </Stack>
        </Typography>
      </div>
      <div className="flex flex-row gap-2 w-full mb-2">
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
        />
      )}
      {lastMatch && (
        <QuickLink
          label="Vorige Wedstrijd"
          subtitle1={lastMatch.subtitle1}
          subtitle2={lastMatch.subtitle2}
          IconComponent={BarChartIcon}
          to={lastMatch.to}
        />
      )}
      {primaryPoule && (
        <QuickLink
          label="Competitie"
          subtitle1={primaryPoule.subtitle1}
          subtitle2={primaryPoule.subtitle2}
          IconComponent={EmojiEventsIcon}
          to={primaryPoule.to}
        />
      )}
    </div>
  )
}

function WinRateStat({ label, played, lost, won }: { label: string, played: number, lost: number, won: number }) {
  return (
    <div className="w-full bg-panel border border-panel-border p-2 rounded-lg text-center grow">
      <Typography variant="h6" fontWeight={500} fontSize={18}>{label}</Typography>
      <Typography variant="h6" fontWeight={400} fontSize={18}>{played}</Typography>
      <Typography variant="h6" fontWeight={300} fontSize={16}>
        {' '}
        (
        <span className="text-green-700 dark:text-green-300">
          {won}
        </span>
        /
        {won + lost < played && (
          <>
            <span className="text-gray-700 dark:text-gray-300">
              {played - won - lost}
            </span>
            /
          </>
        )}
        <span className="text-red-700 dark:text-red-300">
          {lost}
        </span>
        )
      </Typography>
    </div>
  )
}

type QuickLinkProps = {
  label: string
  subtitle1: string
  subtitle2: string
  IconComponent: ElementType
  to: string
}

function QuickLink({ label, subtitle1, subtitle2, IconComponent, to }: QuickLinkProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to, { viewTransition: true })
  }

  return (
    <Paper elevation={4} className="w-full rounded-2xl p-2 bg-accent flex flex-row gap-4 items-center cursor-pointer" onClick={handleClick}>
      <IconComponent className="text-white text-[50px]" />
      <div>
        <Typography variant="h5" fontSize={18} fontWeight={500} className="leading-tight uppercase text-white">{label}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} className="leading-tight text-white">{subtitle1}</Typography>
        <Typography variant="h6" fontSize={16} fontWeight={300} className="leading-tight text-white">{subtitle2}</Typography>
      </div>
      <KeyboardArrowRightIcon className="text-white text-[40px] ml-auto" />
    </Paper>
  )
}

function calculatePlannedMatches(data: Data) {
  if (!data) return 0
  const allMatches = data.poules.flatMap(poule => poule.matches)
  const plannedMatches = allMatches.filter(match => match.status.waarde !== 'gespeeld')
  const matchesForTeam = plannedMatches.filter(match => match.teams.some(team => team?.omschrijving === data.fullTeamName))
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
  const plannedMatches = allMatches.filter(m => m.status.waarde === 'gepland' && dayjs(m.datum).isAfter(dayjs().startOf('day')))
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
  const poulesToBeShown = data.poules.filter(poule => poule.standberekening)
  const primaryPoule = poulesToBeShown[poulesToBeShown.length - 1]
  if (!primaryPoule) return null

  return {
    subtitle1: primaryPoule.name,
    subtitle2: `${primaryPoule.positie}e plaats met ${primaryPoule.punten} punten`,
    to: `/team/${data.clubId}/${data.teamType}/${data.teamId}/poule?pouleId=${primaryPoule.poule}`,
  }
}
