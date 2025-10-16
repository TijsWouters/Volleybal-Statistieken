import { useContext, useEffect, useState } from 'react'
import { Divider, Paper, Typography, Switch, FormControlLabel } from '@mui/material'
import Match from '../../components/Match'
import { TeamContext } from '../TeamRoutes'

import '../../styles/team-matches.css'
import BackLink from '../../components/BackLink'

export default function TeamMatches({ future }: { future: boolean }) {
  const data = useContext(TeamContext)

  useEffect(() => {
    if (data?.fullTeamName) {
      document.title = `${future ? 'Programma' : 'Uitslagen'} - ${data.fullTeamName}`
    }
  }, [future, data?.fullTeamName])

  const [showAllMatches, setShowAllMatches] = useState(false)

  let matches = data?.poules.flatMap((poule) => poule.matches)
  if (future) {
    matches = matches?.filter((match) => match.status.waarde !== 'gespeeld')
    matches = matches?.sort(sortOnDateAndTime)
  }
  else {
    matches = matches?.filter((match) => match.status.waarde === 'gespeeld')
    matches = matches?.sort(sortOnDateAndTime).reverse()
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
    <Paper elevation={4} className="team-matches">
      <BackLink to={`/team/${data.clubId}/${data.teamType}/${data.teamId}`} text={'Terug naar ' + data?.fullTeamName} />
      <Typography variant="h2">{future ? 'Programma' : 'Uitslagen'}</Typography>
      <Typography variant="h5">{data?.fullTeamName}</Typography>

      <FormControlLabel
        control={<Switch onChange={() => setShowAllMatches((v) => !v)} checked={showAllMatches} />}
        label="Laat alle wedstrijden van poules zien"
        labelPlacement="start"
      />

      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />

      <div className="matches-list">
        {matches.map((match) => (
          <Match
            teamName={data.poules.find((poule) => poule.name === match.pouleName)!.omschrijving}
            key={match.uuid}
            match={match}
            result={!future}
          />
        ))}
      </div>
    </Paper>
  )
}


function sortOnDateAndTime(a: Match, b: Match) {
  const dateA = new Date(a.datum)
  const dateB = new Date(b.datum)
  if (dateA.getTime() !== dateB.getTime()) {
    return dateA.getTime() - dateB.getTime()
  }

  const timeA = new Date(a.tijdstip)
  const timeB = new Date(b.tijdstip)
  return timeA.getTime() - timeB.getTime()
}