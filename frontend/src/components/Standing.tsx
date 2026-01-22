import { useNavigate, useParams, Link as RouterLink } from 'react-router'
import type { BTModel } from '@/statistics-utils/bradley-terry'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Link } from '@mui/material'
import { useEffect, useState } from 'react'
import { interpolateRedToGreen } from '@/utils/interpolate-color'

export const PD_COLORS = {
  KAMPIOEN: 'bg-champion',
  PROMOTIE: 'bg-promotion',
  PROMOTIE_WEDSTRIJDEN: 'bg-promotion-matches',
  HANDHAVING: 'bg-handhaving',
  DEGRADATIE_WEDSTRIJDEN: 'bg-relegation-matches',
  DEGRADATIE: 'bg-relegation',
}

const OUTCOMES = ['Kampioen', 'Promotie', 'Promotiewedstrijden', 'Handhaving', 'Degradatiewedstrijden', 'Degradatie']

type StandingProps = {
  poule: Poule
  anchorTeam: string
  bt: BTModel
  framed?: boolean
}

export default function Standing({ poule, anchorTeam, bt, framed = false }: StandingProps) {
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
    if (framed) navigate(`/team/${clubId}/${teamType}/${teamId}/poule?pouleId=${poule.poule}`, { viewTransition: true })
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

  const viewName = `standing-container-${poule.name.replace(/ /g, '-')}`
  const containerClasses = framed ? 'standing framed flex flex-col rounded-4xl w-full bg-panel border border-panel-border p-2 cursor-pointer text-white' : 'standing main flex flex-col w-full bg-transparent text-white'

  return (
    <div className={containerClasses} key={poule.poule} onClick={framed ? handlePouleClick : undefined} style={{ viewTransitionName: viewName }}>
      <div className={`${framed ? 'overflow-x-hidden' : 'overflow-x-auto'} w-full`}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="h6" fontWeight={700} fontSize={20} className="dark:text-white">{poule.name}</Typography>
              </TableCell>
              <TableCell align="center">{useShort ? 'Ptn' : 'Punten'}</TableCell>
              <TableCell align="center">{useShort ? 'W' : 'Gewonnen'}</TableCell>
              <TableCell align="center">{useShort ? 'V' : 'Verloren'}</TableCell>
              <TableCell align="center">{useShort ? 'GS' : 'Wedstrijden'}</TableCell>
              <TableCell align="center" className="text-2xl">💪</TableCell>
              {!framed && (
                <>
                  <TableCell align="center">{useShort ? 'S+' : 'Sets voor'}</TableCell>
                  <TableCell align="center">{useShort ? 'S-' : 'Sets tegen'}</TableCell>
                  <TableCell align="center">{useShort ? 'P+' : 'Punten voor'}</TableCell>
                  <TableCell align="center">{useShort ? 'P-' : 'Punten tegen'}</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map(team => (
              <TableRow key={team['@id']} className={team.omschrijving === anchorTeam ? 'bg-(--highlight-color)' : ''}>
                <TableCell
                  className={`font-bold text-[1.2rem] ${pdColor[team.positie - 1]}`}
                  align="center"
                >
                  {team.positie || team.indelingsletter}
                </TableCell>
                <TableCell>
                  {framed
                    ? (team.omschrijving)
                    : (
                        <Link component={RouterLink} to={getTeamUrl(team.team)} viewTransition>{team.omschrijving}</Link>
                      )}
                </TableCell>
                <TableCell align="center">{Math.round(team.punten)}</TableCell>
                <TableCell align="center">{Math.round(team.wedstrijdenWinst)}</TableCell>
                <TableCell align="center">{Math.round(team.wedstrijdenVerlies)}</TableCell>
                <TableCell align="center">{Math.round(team.gespeeld)}</TableCell>
                <TableCell sx={{ backgroundColor: strengthToColor(formatStrength(bt, anchorTeam, team.omschrijving)), fontWeight: 'bold', textAlign: 'center' }}>
                  {formatStrength(bt, anchorTeam, team.omschrijving)}
                </TableCell>
                {!framed && (
                  <>
                    <TableCell align="center">{Math.round(team.setsVoor)}</TableCell>
                    <TableCell align="center">{Math.round(team.setsTegen)}</TableCell>
                    <TableCell align="center">{Math.round(team.puntenVoor)}</TableCell>
                    <TableCell align="center">{Math.round(team.puntenTegen)}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!framed && (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ marginTop: 1 }}>
          Scroll horizontaal om alle gegevens te bekijken.
        </Typography>
      )}
      <div className="m-2 gap-2 flex justify-center flex-wrap">
        {poule.pdRegeling && OUTCOMES.map((outcome, index) => (
          <div key={index} className="flex items-center gap-2 rounded-sm">
            <div className={`w-4 h-4 ${Object.values(PD_COLORS)[index]}`} />
            <Typography sx={{ display: 'inline-block' }} className="text-black dark:text-white">{outcome}</Typography>
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
  const roundedScore = Math.round(bt.strengths[team] * 100)
  return roundedScore > 0 ? `+${roundedScore}` : `${roundedScore}`
}

// Converts a strength (-25 to 25) to a color from red (weak) to green (strong)
function strengthToColor(formattedStrength: string) {
  let s = formattedStrength === '-' ? 0 : parseInt(formattedStrength)
  s = Math.max(-75, Math.min(75, s))
  s = (s + 75) / 150 // scale to 0-1
  return interpolateRedToGreen(s)
}

function getTeamUrl(team: string) {
  const parts = team.split('/')
  return `/team/${parts[3]}/${parts[4]}/${parts[5]}/overview`
}
