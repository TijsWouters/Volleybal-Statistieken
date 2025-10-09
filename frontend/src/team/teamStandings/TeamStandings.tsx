import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Paper, Typography, Stack, Divider, Table, TableHead, TableBody, TableRow, TableCell, Box, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useTeamData } from '../../query'

export default function TeamStandings() {
  const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>()
  const { data, isPending } = useTeamData(clubId!, teamType!, teamId!)

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

  if (isPending) {
    return <Typography variant="h2">Laden...</Typography>
  }

  return (
    <Paper sx={{ padding: '1rem', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link component={RouterLink} to={`/team/${clubId}/${teamType}/${teamId}`} sx={{ alignSelf: 'flex-start' }}>
        <Stack alignItems="center" direction="row" gap={1}>
          <ArrowBackIcon />
          {'Terug naar ' + data?.fullTeamName}
        </Stack>
      </Link>
      <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>STANDEN</Typography>
      <Typography variant="h4" sx={{ textAlign: 'center' }}>{data?.fullTeamName}</Typography>
      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />
      <Stack spacing={2} sx={{ maxWidth: '100%' }}>
        {data.poules.map((p: any) => PouleStanding(p, data.fullTeamName, data.bt, useShort))}
      </Stack>
    </Paper>
  )
}

function PouleStanding(poule: any, anchorTeam: string, bt: any[], useShort: boolean = false) {
  const sortedTeams = [...poule.teams].sort((a, b) => a.positie - b.positie)
  const btForPoule = bt[poule.name]

  return (
    <Box key={poule.poule} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9e6ff', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', width: '100%' }}>{poule.name}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{useShort ? 'Pos' : 'Positie'}</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>{useShort ? 'Ptn' : 'Punten'}</TableCell>
            <TableCell>{useShort ? 'G' : 'Gewonnen'}</TableCell>
            <TableCell>{useShort ? 'V' : 'Verloren'}</TableCell>
            <TableCell>{useShort ? 'W' : 'Wedstrijden'}</TableCell>
            <TableCell>{useShort ? 'Sets+' : 'Sets voor'}</TableCell>
            <TableCell>{useShort ? 'Sets-' : 'Sets tegen'}</TableCell>
            <TableCell>{useShort ? 'Ptn+' : 'Punten voor'}</TableCell>
            <TableCell>{useShort ? 'Ptn-' : 'Punten tegen'}</TableCell>
            <TableCell>Kracht</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTeams.map((team: any) => (
            <TableRow key={team['@id']} sx={{ backgroundColor: team.omschrijving === anchorTeam ? '#f3ccff' : 'inherit' }}>
              <TableCell>{team.positie || team.indelingsletter}</TableCell>
              <TableCell>{team.omschrijving}</TableCell>
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
    </Box>
  )
}

function formatStrength(bt: any, anchorTeam: string, team: string) {
  if (!bt.predictionPossible(anchorTeam, team)) {
    return '-'
  }
  const roundedScore = Math.round(bt.strengths[team] * 100)
  return roundedScore > 0 ? `+${roundedScore}` : `${roundedScore}`
}

// Converts a strength (-25 to 25) to a color from red (weak) to green (strong)
function strengthToColor(formattedStrength: string) {
  let s = formattedStrength === '-' ? 0 : parseInt(formattedStrength)
  s = Math.max(-25, Math.min(25, s))
  s = (s + 25) * 2 // scale to 0-100
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
  return '#' + ('000000' + h.toString(16)).slice(-6)
}
