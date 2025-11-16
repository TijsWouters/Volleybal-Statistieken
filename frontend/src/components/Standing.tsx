import { useNavigate, useParams, Link as RouterLink } from 'react-router'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Link, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { useEffect, useState } from 'react'

export const PD_COLORS = {
  KAMPIOEN: '#FFD700',
  PROMOTIE: '#32CD32',
  PROMOTIE_WEDSTRIJDEN: '#90EE90',
  HANDHAVING: '#cccccc',
  DEGRADATIE_WEDSTRIJDEN: '#FFB6C1',
  DEGRADATIE: '#FF6347',
}

const OUTCOMES = ['Kampioen', 'Promotie', 'Promotiewedstrijden', 'Handhaving', 'Degradatiewedstrijden', 'Degradatie']

export default function Standing({ poule, anchorTeam, bt, linkPoule = true, showDecimals = false}: { poule: Poule, anchorTeam: string, bt: BTModel, linkPoule?: boolean, showDecimals?: boolean }) {
  const sortedTeams = [...poule.teams].sort((a, b) => a.positie - b.positie)
  const navigate = useNavigate()
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>()

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

  const handlePouleClick = () => {
    if (!linkPoule) return
    navigate(`/team/${clubId}/${teamType}/${teamId}/poule?pouleId=${poule.poule}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pdColor = sortedTeams.map(_ => '')
  if (poule.pdRegeling) {
    for (let i = 1; i <= sortedTeams.length; i++) {
      if (i === 1) pdColor[i - 1] = PD_COLORS.KAMPIOEN
      else if (poule.pdRegeling.aantalPromotie && i <= poule.pdRegeling.promotieLaagste!) pdColor[i - 1] = PD_COLORS.PROMOTIE
      else if (poule.pdRegeling.aantalPromotiewedstrijden && i <= poule.pdRegeling.promotiewedstrijdenLaagste!) pdColor[i - 1] = PD_COLORS.PROMOTIE_WEDSTRIJDEN
      else if (poule.pdRegeling.aantalHandhaving && i <= poule.pdRegeling.handhavingLaagste!) pdColor[i - 1] = PD_COLORS.HANDHAVING
      else if (poule.pdRegeling.aantalDegradatiewedstrijden && i <= poule.pdRegeling.degradatiewedstrijdenLaagste!) pdColor[i - 1] = PD_COLORS.DEGRADATIE_WEDSTRIJDEN
      else if (poule.pdRegeling.aantalDegradatie && i <= poule.pdRegeling.degradatieLaagste!) pdColor[i - 1] = PD_COLORS.DEGRADATIE
    }
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
            <TableCell align="center">{useShort ? 'W' : 'Gewonnen'}</TableCell>
            <TableCell align="center">{useShort ? 'V' : 'Verloren'}</TableCell>
            <TableCell align="center">{useShort ? 'GS' : 'Wedstrijden'}</TableCell>
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
              <TableCell
                className="team-position-cell"
                align="center"
                style={{ backgroundColor: pdColor[team.positie - 1] }}
              >
                {team.positie || team.indelingsletter}
              </TableCell>
              <TableCell>
                <Link component={RouterLink} to={getTeamUrl(team.team)}>{team.omschrijving}</Link>
              </TableCell>
              <TableCell align="center">{showDecimals ? team.punten.toFixed(1) : Math.round(team.punten)}</TableCell>
              <TableCell align="center">{showDecimals ? team.wedstrijdenWinst.toFixed(1) : Math.round(team.wedstrijdenWinst)}</TableCell>
              <TableCell align="center">{showDecimals ? team.wedstrijdenVerlies.toFixed(1) : Math.round(team.wedstrijdenVerlies)}</TableCell>
              <TableCell align="center">{showDecimals ? (team.wedstrijdenWinst + team.wedstrijdenVerlies).toFixed(1) : Math.round(team.wedstrijdenWinst + team.wedstrijdenVerlies)}</TableCell>
              <TableCell align="center">{showDecimals ? team.setsVoor.toFixed(1) : Math.round(team.setsVoor)}</TableCell>
              <TableCell align="center">{showDecimals ? team.setsTegen.toFixed(1) : Math.round(team.setsTegen)}</TableCell>
              <TableCell align="center">{showDecimals ? team.puntenVoor.toFixed(1) : Math.round(team.puntenVoor)}</TableCell>
              <TableCell align="center">{showDecimals ? team.puntenTegen.toFixed(1) : Math.round(team.puntenTegen)}</TableCell>
              <TableCell sx={{ backgroundColor: strengthToColor(formatStrength(bt, anchorTeam, team.omschrijving)), fontWeight: 'bold', textAlign: 'center' }}>
                {formatStrength(bt, anchorTeam, team.omschrijving)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ margin: 8, gap: 8, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {poule.pdRegeling && OUTCOMES.map((outcome, index) => (
          <div
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 4,
            }}
          >
            <div style={{ width: 18, height: 18, backgroundColor: Object.values(PD_COLORS)[index] }}></div>
            <Typography sx={{ display: 'inline-block' }}>{outcome}</Typography>
          </div>
        ))}
      </div>
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
