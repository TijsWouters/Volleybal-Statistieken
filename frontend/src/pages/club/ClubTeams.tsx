import { Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router'

import TEAM_TYPES from '@/assets/teamTypes.json'
import { useClubData } from '@/query'
import AccordionEntry from '@/components/AccordionEntry'
import { getIconForTeamType } from '@/utils/team-type-icons'
import { useEffect } from 'react'

export default function ClubTeams() {
  const { data: club } = useClubData()

  useEffect(() => {
    if (club?.naam) {
      document.title = `${club.naam} - Teams`
    }
  }, [club?.naam])

  if (!club) return null

  const teamByType = groupTeamsByType(club.teams)
  return (
    <div>
      {Object.entries(teamByType).map(([type, teams]) => {
        return (
          <AccordionEntry key={type} title={`${type} (${teams.length})`} IconComponent={getIconForTeamType(type)}>
            {teams.map(team => (
              <div key={team.naam} className="flex flex-col mb-4">
                <Link component={RouterLink} to={getTeamUrl(team)} className="leading-[1.2]" viewTransition>
                  <Typography variant="h6" className="leading-none">{team.naam}</Typography>
                </Link>
                <Typography
                  key={team.naam}
                  variant="subtitle1"
                  className="leading-none dark:text-white"
                  sx={{
                    fontWeight: 300,
                  }}
                >
                  {team.standpositietekst}
                </Typography>
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
  return `/team/${lastThree}/overview`
}
