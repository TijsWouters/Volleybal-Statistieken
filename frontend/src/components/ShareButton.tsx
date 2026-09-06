import ShareIcon from '@mui/icons-material/Share'
import { IconButton } from '@mui/material'
import { useClubData, useMatchData, usePouleData, useTeamData, type Data, useRouteData } from '@/query'
import { useLocation } from 'react-router'
import dayjs from 'dayjs'

type Summary = {
  title?: string
  text?: string
  url?: string
}

export default function ShareButton() {
  const { data: teamData } = useTeamData()
  const matchData = useMatchData()
  const { data: clubData } = useClubData()
  const { data: pouleData } = usePouleData()
  const { data: locationData } = useRouteData()
  const location = useLocation()

  const summary = generateSummary(location.pathname, teamData, matchData, clubData, pouleData, locationData?.locationData)

  if (!navigator.canShare || !navigator.canShare(summary)) {
    return null
  }

  const handleClick = async () => {
    try {
      await navigator.share(summary)
    }
    catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <IconButton
      size="large"
      edge="end"
      color="inherit"
      onClick={handleClick}
      className="ignore-transition"
      style={{ viewTransitionName: 'share-button' }}
    >
      <ShareIcon />
    </IconButton>
  )
}

const numberEmojies = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

function toEmojiNumber(num: number): string {
  if (num >= 0 && num < numberEmojies.length) {
    return numberEmojies[num]
  }
  const splitted = num.toString().split('')
  return splitted.map(digit => numberEmojies[parseInt(digit)]).join('')
}

function generateSummary(
  path: string,
  teamData: Data | null | undefined,
  matchData: DetailedMatchInfo | null | undefined,
  clubData: ClubWithTeams | null | undefined,
  pouleData: DetailedPouleInfo | null | undefined,
  locationData: Location | null | undefined,
): Summary {
  if (path.startsWith('/team/') && teamData) {
    if (path.includes('/match/') && matchData && locationData) {
      const lines = [
        `🏐 ${matchData.teams[0].omschrijving} - ${matchData.teams[1].omschrijving}`,
        `📅 ${dayjs(matchData.datum).format('ddd D MMM YYYY')}`,
        `⏰ ${dayjs(matchData.tijdstip).format('HH:mm')}`,
        `📍 ${locationData.naam}, ${locationData.adres.plaats}`,
      ]

      if (matchData.status.waarde.toLowerCase() === 'gespeeld') {
        lines.push(`🏆 Uitslag: ${matchData.eindstand![0]} - ${matchData.eindstand![1]}`)
        for (const set of matchData.setstanden!) {
          lines.push(`${toEmojiNumber(set.set)} ${set.puntenA} - ${set.puntenB}`)
        }
      }
      else if (matchData.prediction) {
        const teamIndex = matchData.teams[0].omschrijving === matchData.fullTeamName ? 0 : 1
        lines.push('🔮 Voorspelling:')
        for (const [result, chance] of Object.entries(matchData.prediction)) {
          lines.push(`${parseInt(result.split('-')[teamIndex]) > parseInt(result.split('-')[(teamIndex + 1) % 2]) ? '🟩' : '🟥'} ${result}: ${chance.toFixed(1)}%`)
        }
      }

      return {
        text: lines.join('\n') + '\n',
        url: window.location.href,
      }
    }
    else if (path.includes('/poule') && pouleData) {
      const lines = [
        `📈 Bekijk statistieken voor de poule ${pouleData.name} van ${pouleData.fullTeamName}`,
      ].join('\n')
      return {
        text: lines + '\n',
        url: window.location.href,
      }
    }
    else if (path.includes('matches') && teamData) {
      const scheduledMatches = teamData.poules.flatMap(poule => poule.matches).filter(match => !match.eindstand).filter(match => match.teams.some(team => team.omschrijving === teamData.fullTeamName))
      const lines = [
        `📅 Geplande wedstrijden voor ${teamData.fullTeamName}:`,
        ...scheduledMatches.map((match) => {
          const opponent = match.teams.find(team => team.omschrijving !== teamData.fullTeamName)
          return `- ${dayjs(match.datum).format('ddd D MMM')} ${dayjs(match.tijdstip).format('HH:mm')} 🆚 ${opponent?.omschrijving}`
        }),
      ].join('\n')
      return {
        text: lines + '\n',
        url: window.location.href.split('?')[0],
      }
    }
    else if (path.includes('results') && teamData) {
      const playedMatches = teamData.poules.flatMap(poule => poule.matches).filter(match => match.eindstand).filter(match => match.teams.some(team => team.omschrijving === teamData.fullTeamName))
      const lines = [
        `📊 Resultaten van ${teamData.fullTeamName}:`,
        ...[...playedMatches].reverse().map((match) => {
          const opponent = match.teams.find(team => team.omschrijving !== teamData.fullTeamName)
          const won = (match.eindstand![0] > match.eindstand![1] && match.teams[0].omschrijving === teamData.fullTeamName) || (match.eindstand![1] > match.eindstand![0] && match.teams[1].omschrijving === teamData.fullTeamName)
          return `${toEmojiNumber(match.eindstand![0])}-${toEmojiNumber(match.eindstand![1])} ${won ? 'gewonnen' : 'verloren'} 🆚 ${opponent?.omschrijving}`
        }),
      ].join('\n')
      return {
        text: lines + '\n',
        url: window.location.href.split('?')[0],
      }
    }
    else if (path.includes('standings') && teamData) {
      console.log(teamData.poules)
      const lines = [
        `📊 Poulestanden van ${teamData.fullTeamName}:`,
        ...[...teamData.poules].filter(p => p.standberekening).reverse().map((poule) => {
          if (poule.positie) {
            return `- ${poule.name}: plek ${toEmojiNumber(poule.positie)} met ${toEmojiNumber(poule.punten)} punten`
          }
          else {
            return `- ${poule.name}`
          }
        }),
      ].join('\n')
      return {
        text: lines + '\n',
        url: window.location.href.split('?')[0],
      }
    }

    const lines = [
      `👥 ${teamData.fullTeamName}`,
      `📍 ${teamData.club.vestigingsplaats}, ${teamData.club.provincie}`,
      (teamData.poules.length > 0 ? `🏆 ${teamData.poules[teamData.poules.length - 1].name}` : ''),
    ].join('\n')

    return {
      text: lines + '\n',
      url: window.location.href,
    }
  }
  else if (path.startsWith('/club/') && clubData) {
    const lines = [
      `🏐 ${clubData.naam}`,
      `📍 ${clubData.vestigingsplaats}, ${clubData.provincie}`,
      `👥 ${clubData.teams.length} teams`,
    ]

    return {
      text: lines.join('\n') + '\n',
      url: window.location.href,
    }
  }
  else {
    return {
      text: 'Bekijk de leukste statistieken en voorspellingen op',
      url: 'volleybal-statistieken.nl',
    }
  }
}
