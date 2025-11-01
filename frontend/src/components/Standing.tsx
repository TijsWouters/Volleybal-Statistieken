import { useNavigate, useParams, Link as RouterLink } from 'react-router'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Link, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'

export default function Standing({ poule, anchorTeam, bt, useShort = false, linkPoule = true}: { poule: Poule, anchorTeam: string, bt: BTModel, useShort?: boolean, linkPoule?: boolean }) {
  const sortedTeams = [...poule.teams].sort((a, b) => a.positie - b.positie)
  const navigate = useNavigate()
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>()

  const handlePouleClick = () => {
    if (!linkPoule) return
    navigate(`/team/${clubId}/${teamType}/${teamId}/poule?pouleId=${poule.poule}`)
  }

  return (
    <div className="standing" key={poule.poule}>
      <Typography variant="h5" className="poule-name" onClick={handlePouleClick} style={linkPoule ? { cursor: 'pointer', textDecoration: 'underline' } : {}}>{poule.name}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{useShort ? 'Pos' : 'Positie'}</TableCell>
            <TableCell>Team</TableCell>
            <TableCell align="center">{useShort ? 'Ptn' : 'Punten'}</TableCell>
            <TableCell align="center">{useShort ? 'G' : 'Gewonnen'}</TableCell>
            <TableCell align="center">{useShort ? 'V' : 'Verloren'}</TableCell>
            <TableCell align="center">{useShort ? 'W' : 'Wedstrijden'}</TableCell>
            <TableCell align="center">{useShort ? 'S+' : 'Sets voor'}</TableCell>
            <TableCell align="center">{useShort ? 'S-' : 'Sets tegen'}</TableCell>
            <TableCell align="center">{useShort ? 'P+' : 'Punten voor'}</TableCell>
            <TableCell align="center">{useShort ? 'P-' : 'Punten tegen'}</TableCell>
            <TableCell>
              <Tooltip title="De kracht geeft aan hoe sterk een team is ten opzichte van de andere teams in de poule. Dit is gebaseerd op alle gespeelde wedstrijden in deze competitie." placement="top" arrow>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Kracht
                  <HelpIcon fontSize="small" sx={{ marginLeft: '4px', cursor: 'help' }} />
                </div>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTeams.map(team => (
            <TableRow key={team['@id']} className={`${team.omschrijving === anchorTeam ? 'highlight' : ''}`}>
              <TableCell className="team-position-cell" align="center">{team.positie || team.indelingsletter}</TableCell>
              <TableCell>
                <Link component={RouterLink} to={getTeamUrl(team.team)}>{team.omschrijving}</Link>
              </TableCell>
              <TableCell align="center">{team.punten}</TableCell>
              <TableCell align="center">{team.wedstrijdenWinst}</TableCell>
              <TableCell align="center">{team.wedstrijdenVerlies}</TableCell>
              <TableCell align="center">{team.wedstrijdenWinst + team.wedstrijdenVerlies}</TableCell>
              <TableCell align="center">{team.setsVoor}</TableCell>
              <TableCell align="center">{team.setsTegen}</TableCell>
              <TableCell align="center">{team.puntenVoor}</TableCell>
              <TableCell align="center">{team.puntenTegen}</TableCell>
              <TableCell sx={{ backgroundColor: strengthToColor(formatStrength(bt, anchorTeam, team.omschrijving)), fontWeight: 'bold', textAlign: 'center' }}>
                {formatStrength(bt, anchorTeam, team.omschrijving)}
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
  const roundedScore = Math.round(-bt.strengths[team] * 100)
  return roundedScore > 0 ? `+${roundedScore}` : `${roundedScore}`
}

// Converts a strength (-25 to 25) to a color from red (weak) to green (strong)
function strengthToColor(formattedStrength: string) {
  let s = formattedStrength === '-' ? 0 : parseInt(formattedStrength)
  s = Math.max(-75, Math.min(75, s))
  s = (s + 75) * 100 / 150 // scale to 0-100
  const maxG = 230
  const maxR = 230

  let r, g = 0
  if (s < 50) {
    r = maxR
    g = Math.round(maxG / 50 * s)
  }
  else {
    g = maxG
    r = Math.round(maxR * 2 - (2 * maxR / 100) * s)
  }
  const h = r * 0x10000 + g * 0x100
  return '#' + ('000000' + h.toString(16)).slice(-6)
}

function getTeamUrl(team: string) {
  const parts = team.split('/')
  return `/team/${parts[3]}/${parts[4]}/${parts[5]}`
}
