import { useContext, useEffect, useState } from 'react'
import { Paper, Typography, Stack, Divider, Table, TableHead, TableBody, TableRow, TableCell, Tooltip, Link } from '@mui/material'
import { TeamContext } from '../TeamRoutes'
import type { BTModel } from 'src/hooks/useBT'
import type { Poule } from 'types'
import HelpIcon from '@mui/icons-material/Help';
import { Link as RouterLink } from 'react-router'

import '../../styles/team-standings.css'
import BackLink from '../../components/BackLink'

export default function TeamStandings() {
  const data = useContext(TeamContext)
  useEffect(() => {
    document.title = `Standen - ${data.fullTeamName}`
  }, [])

  const [useShort, setUseShort] = useState(window.innerWidth < 1000)

  useEffect(() => {
    const handleResize = () => {
      setUseShort(window.innerWidth < 1000)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Paper className="team-standings">
      <BackLink to={`/team/${data.clubId}/${data.teamType}/${data.teamId}`} text={'Terug naar ' + data?.fullTeamName} />
      <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>STANDEN</Typography>
      <Typography variant="h4" sx={{ textAlign: 'center' }}>{data?.fullTeamName}</Typography>
      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />
      <Stack spacing={2} sx={{ maxWidth: '100%' }}>
        {data.poules.toReversed().map((p) => PouleStanding(p, data.fullTeamName, data.bt, useShort))}
      </Stack>
    </Paper>
  )
}

function PouleStanding(poule: Poule, anchorTeam: string, bt: { [pouleName: string]: BTModel }, useShort: boolean = false) {
  const sortedTeams = [...poule.teams].sort((a, b) => a.positie - b.positie)
  const btForPoule = bt[poule.name]

  return (
    <div className="standing" key={poule.poule}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{poule.name}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{useShort ? 'Pos' : 'Positie'}</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>{useShort ? 'Ptn' : 'Punten'}</TableCell>
            <TableCell>{useShort ? 'G' : 'Gewonnen'}</TableCell>
            <TableCell>{useShort ? 'V' : 'Verloren'}</TableCell>
            <TableCell>{useShort ? 'W' : 'Wedstrijden'}</TableCell>
            <TableCell>{useShort ? 'S+' : 'Sets voor'}</TableCell>
            <TableCell>{useShort ? 'S-' : 'Sets tegen'}</TableCell>
            <TableCell>{useShort ? 'P+' : 'Punten voor'}</TableCell>
            <TableCell>{useShort ? 'P-' : 'Punten tegen'}</TableCell>
            <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Kracht
              <Tooltip title="De kracht geeft aan hoe sterk een team is ten opzichte van de andere teams in de poule. Dit is gebaseerd op alle gespeelde wedstrijden in deze competitie." placement="top" arrow>
                <HelpIcon fontSize="small" sx={{ marginLeft: '4px', cursor: 'help' }} />
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTeams.map((team) => (
            <TableRow key={team['@id']} className={`${team.omschrijving === anchorTeam ? 'highlight' : ''}`}>
              <TableCell>{team.positie || team.indelingsletter}</TableCell>
              <TableCell>
                <Link component={RouterLink}to={getTeamUrl(team.team)}>{team.omschrijving}</Link>
              </TableCell>
              <TableCell>{team.punten}</TableCell>
              <TableCell>{team.wedstrijdenWinst}</TableCell>
              <TableCell>{team.wedstrijdenVerlies}</TableCell>
              <TableCell>{team.wedstrijdenWinst + team.wedstrijdenVerlies}</TableCell>
              <TableCell>{team.setsVoor}</TableCell>
              <TableCell>{team.setsTegen}</TableCell>
              <TableCell>{team.puntenVoor}</TableCell>
              <TableCell>{team.puntenTegen}</TableCell>
              <TableCell sx={{ backgroundColor: strengthToColor(formatStrength(btForPoule, anchorTeam, team.omschrijving)), fontWeight: 'bold', textAlign: 'center' }}>
                {formatStrength(btForPoule, anchorTeam, team.omschrijving)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatStrength(bt: BTModel, anchorTeam: string, team: string) {
  if (!bt.predictionPossible(anchorTeam, team)) {
    return '-'
  }
  const roundedScore = Math.round(bt.strengths[team] * 100)
  return roundedScore > 0 ? `+${roundedScore}` : `${roundedScore}`
}

// Converts a strength (-25 to 25) to a color from red (weak) to green (strong)
function strengthToColor(formattedStrength: string) {
  let s = formattedStrength === '-' ? 0 : parseInt(formattedStrength)
  s = Math.max(-40, Math.min(40, s))
  s = (s + 40) * 100 / 80 // scale to 0-100
  let r, g = 0
  if (s < 50) {
    r = 255
    g = Math.round(5.1 * s)
  }
  else {
    g = 255
    r = Math.round(510 - 5.10 * s)
  }
  const h = r * 0x10000 + g * 0x100
  return '#' + ('000000' + h.toString(16)).slice(-6) + 'cc' // add alpha
}

function getTeamUrl(team: string) {
  const parts = team.split('/')
  return `/team/${parts[3]}/${parts[4]}/${parts[5]}`
}
