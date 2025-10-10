import { useContext, useEffect, useState } from 'react'
import { Divider, Paper, Stack, Typography, Switch, FormControlLabel, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Match from '../../components/Match'
import { TeamContext } from '../TeamRoutes'

export default function TeamMatches({ future }: { future: boolean }) {
  const data = useContext(TeamContext)
  useEffect(() => {
    document.title = `${future ? 'Programma' : 'Uitslagen'} - ${data.fullTeamName}`
  }, [future])

  const [showAllMatches, setShowAllMatches] = useState(false)

  let matches = data?.poules.flatMap((poule) => poule.matches)
  if (future) {
    matches = matches?.filter((match) => match.status.waarde !== 'gespeeld')
  }
  else {
    matches = matches?.filter((match) => match.status.waarde === 'gespeeld')
  }

  if (!showAllMatches) {
    matches = matches?.filter((match) => match.teams.some((team) => team.omschrijving === data.fullTeamName))
  }

  const predictions: (Record<string, string> | null)[] = []
  if (future) {
    for (const match of matches) {
      const btModelForPoule = data.bt[match.pouleName]
      const pouleForMatch = data.poules.find((poule) => poule.name === match.pouleName)
      const pointMethod = pouleForMatch?.puntentelmethode
      const matchPredictions = btModelForPoule.matchBreakdown(match.teams[0].omschrijving, match.teams[1].omschrijving, pointMethod)
      predictions.push(matchPredictions)
    }
  }

  // TODO: improve performance for many matches

  return (
    <Paper sx={{ padding: '1rem', maxWidth: 'fit-content', marginTop: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link component={RouterLink} to={`/team/${data.clubId}/${data.teamType}/${data.teamId}`} sx={{ alignSelf: 'flex-start' }}>
        <Stack alignItems="center" direction="row" gap={1}>
          <ArrowBackIcon />
          {'Terug naar ' + data?.fullTeamName}
        </Stack>
      </Link>
      <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>{future ? 'PROGRAMMA' : 'UITSLAGEN'}</Typography>
      <Typography variant="h4" sx={{ textAlign: 'center' }}>{data?.fullTeamName}</Typography>
      <FormControlLabel
        control={<Switch onChange={() => setShowAllMatches(!showAllMatches)} checked={showAllMatches} />}
        label="Laat ook wedstrijden van andere teams zien"
        labelPlacement="start"
      />
      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />
      <Stack spacing={2} sx={{ maxWidth: 'fit-content' }}>
        {matches.map((match, index) => (
          <Match key={index} match={match} result={!future} prediction={future ? predictions[index] : null} />
        ))}
      </Stack>
    </Paper>
  )
}
