import { Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router'

import TEAM_TYPES from '@/assets/teamTypes.json'
import { useClubData } from '@/query'
import AccordionEntry from '@/components/AccordionEntry'

import MaleIcon from '@mui/icons-material/Man'
import FemaleIcon from '@mui/icons-material/Woman'
import MixedIcon from '@mui/icons-material/Wc'
import ElderlyMaleIcon from '@mui/icons-material/Elderly'
import ElderlyFemaleIcon from '@mui/icons-material/ElderlyWoman'
import BoyIcon from '@mui/icons-material/Boy'
import GirlIcon from '@mui/icons-material/Girl'
import ChildIcon from '@mui/icons-material/ChildCare'
import SitIcon from '@mui/icons-material/SelfImprovement'
import StarIcon from '@mui/icons-material/Star'

const ICON_MAP = {
  female: FemaleIcon,
  male: MaleIcon,
  mixed: MixedIcon,
  recmale: ElderlyMaleIcon,
  recfemale: ElderlyFemaleIcon,
  boy: BoyIcon,
  girl: GirlIcon,
  child: ChildIcon,
  sit: SitIcon,
  star: StarIcon,
}

export default function ClubTeams() {
  const { data: club } = useClubData()

  if (!club) return null

  const teamByType = groupTeamsByType(club.teams)
  return (
    <div>
      {Object.entries(teamByType).map(([type, teams]) => {
        const iconKey = (TEAM_TYPES.find(t => t.omschrijving === type)?.icon || 'mixed') as keyof typeof ICON_MAP
        return (
          <AccordionEntry key={type} title={`${type} (${teams.length})`} IconComponent={ICON_MAP[iconKey]}>
            {teams.map(team => (
              <div key={team.naam} style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                <Link component={RouterLink} to={getTeamUrl(team)} style={{ lineHeight: 1 }}>
                  <Typography variant="h6">{team.naam}</Typography>
                </Link>
                <Typography key={team.naam} variant="subtitle1" style={{ lineHeight: 1 }} fontWeight={300}>{team.standpositietekst}</Typography>
              </div>
            ))}
          </AccordionEntry>
        )
      })}
    </div>
  )
}

function groupTeamsByType(teams: TeamForClub[]): { [type: string]: TeamForClub[] } {
  const acc: { [type: string]: TeamForClub[] } = {}
  for (const type of TEAM_TYPES) {
    acc[type.omschrijving] = []
  }

  const teamsByType = teams.reduce((acc, team) => {
    if (!getTeamType(team.naam)) {
      return acc
    }
    if (!acc[getTeamType(team.naam)!]) {
      acc[getTeamType(team.naam)!] = []
    }
    acc[getTeamType(team.naam)!].push(team)
    return acc
  }, acc)

  for (const type of TEAM_TYPES) {
    if (teamsByType[type.omschrijving].length === 0) {
      delete teamsByType[type.omschrijving]
    }
  }
  return teamsByType
}

function getTeamType(teamName: string): string | undefined {
  const parts = teamName.split(' ')
  const afkorting = parts[parts.length - 2]
  return TEAM_TYPES.find(t => t.afkorting === afkorting)?.omschrijving
}

function getTeamUrl(team: TeamForClub): string {
  const parts = team['@id'].split('/')
  const lastThree = parts.slice(-3).join('/')
  return `/team/${lastThree}`
}
