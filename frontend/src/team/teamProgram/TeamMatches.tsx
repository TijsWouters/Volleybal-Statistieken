import { useState } from 'react'
import { Divider, Paper, Stack, Typography, Switch, FormControlLabel, Link } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useTeamData } from '../../query'
import Match from '../../components/Match'

export default function TeamMatches({ future }: { future: boolean }) {
  const { clubId, teamType, teamId } = useParams<{
    clubId: string
    teamType: string
    teamId: string
  }>()

  const [showAllMatches, setShowAllMatches] = useState(false)

  const { data, isPending } = useTeamData(clubId!, teamType!, teamId!)

  if (isPending) return <div>Loading...</div>

  let matches = data?.poules.flatMap((poule: any) => poule.matches)
  if (future) {
    matches = matches?.filter((match: any) => match.status.waarde !== 'gespeeld')
  }
  else {
    matches = matches?.filter((match: any) => match.status.waarde === 'gespeeld')
  }

  if (!showAllMatches) {
    matches = matches?.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName))
  }

  const predictions: any[] = []
  if (future) {
    for (const match of matches) {
      const btModelForPoule = data.bt[match.pouleName]
      const pouleForMatch = data.poules.find((poule: any) => poule.name === match.pouleName)
      const pointMethod = pouleForMatch?.puntentelmethode
      const matchPredictions = btModelForPoule.matchBreakdown(match.teams[0].omschrijving, match.teams[1].omschrijving, pointMethod)
      predictions.push(matchPredictions)
    }
  }

  // TODO: improve performance for many matches

  return (
    <Paper sx={{ padding: '1rem', maxWidth: 'fit-content', marginTop: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link component={RouterLink} to={`/team/${clubId}/${teamType}/${teamId}`} sx={{ alignSelf: 'flex-start' }}>
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
        {matches.map((match: any, index: number) => (
          <Match key={index} match={match} result={!future} predictions={future ? predictions[index] : undefined} />
        ))}
      </Stack>
    </Paper>
  )
}
