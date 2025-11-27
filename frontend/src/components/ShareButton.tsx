import ShareIcon from '@mui/icons-material/Share'
import { IconButton } from '@mui/material'
import { useClubData, useMatchData, usePouleData, useTeamData, type Data, useLocationData } from '@/query'
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
  const { data: locationData } = useLocationData()
  const location = useLocation()

  const summary = generateSummary(location.pathname, teamData, matchData, clubData, pouleData, locationData)

  if (!navigator.canShare || !navigator.canShare(summary)) {
    return null
  }

  return (
    <IconButton
      size="large"
      edge="end"
      color="inherit"
    >
      <ShareIcon />
    </IconButton>
  )
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
  else if (path.includes('/match/') && matchData && locationData) {
    const lines = [
      `🏐 ${matchData.teams[0].omschrijving} - ${matchData.teams[1].omschrijving}`,
      `📅 ${dayjs(matchData.datum).format('ddd D MMM YYYY')}`,
      `⏰ ${dayjs(matchData.tijdstip).format('HH:mm')}`,
      `📍 ${locationData.naam}, ${locationData.adres.plaats}`,
    ]

    const numberEmojies = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

    if (matchData.status.waarde.toLowerCase() === 'gespeeld') {
      lines.push(`🏆 Uitslag: ${matchData.eindstand![0]} - ${matchData.eindstand![1]}`)
      for (const set of matchData.setstanden!) {
        lines.push(`${numberEmojies[set.set]} ${set.puntenA} - ${set.puntenB}`)
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
  return {
    text: 'Bekijk de leukste statistieken en voorspellingen op',
    url: 'volleybal-statistieken.nl',
  }
}
