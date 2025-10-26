import { useContext, useEffect, useState } from 'react'
import { Divider, Paper, Typography, Switch, FormControlLabel } from '@mui/material'
import { sortByDateAndTime } from '@/utils/sorting'
import { TeamContext } from '../TeamRoutes'

import Match from '@/components/Match'

import '@/styles/team-matches.css'
import BackLink from '@/components/BackLink'

export default function TeamMatches({ future }: { future: boolean }) {
  const data = useContext(TeamContext)

  useEffect(() => {
    if (data?.fullTeamName) {
      document.title = `${future ? 'Programma' : 'Uitslagen'} - ${data.fullTeamName}`
    }
  }, [future, data?.fullTeamName])

  const [showAllMatches, setShowAllMatches] = useState(false)

  let matches = data?.poules.flatMap(poule => poule.matches)
  if (future) {
    matches = matches?.filter(match => match.status.waarde !== 'gespeeld')
    matches = matches?.sort(sortByDateAndTime)
  }
  else {
    matches = matches?.filter(match => match.status.waarde === 'gespeeld')
    matches = matches?.sort(sortByDateAndTime).reverse()
  }

  if (!showAllMatches) {
    matches = matches?.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  }

  // TODO: improve performance for many matches
  return (
    <Paper elevation={4} className="team-matches fade-in">
      <BackLink to={`/team/${data.clubId}/${data.teamType}/${data.teamId}`} text={'Terug naar ' + data?.fullTeamName} />
      <Typography variant="h2">{future ? 'Programma' : 'Uitslagen'}</Typography>
      <Typography variant="h5" textAlign="center" fontWeight="bold">
        (
        {data?.fullTeamName}
        )
      </Typography>

      <FormControlLabel
        className="all-matches-switch"
        control={<Switch onChange={() => setShowAllMatches(v => !v)} checked={showAllMatches} />}
        label="Laat alle wedstrijden van alle poules zien"
        labelPlacement="top"
      />

      <Divider sx={{ marginBottom: '1rem', width: '100%' }} />

      <div className="matches-list">
        {matches.map(match => (
          <Match
            teamName={data.poules.find(poule => poule.name === match.pouleName)!.omschrijving}
            key={match.uuid}
            match={match}
            result={!future}
          />
        ))}
      </div>
    </Paper>
  )
}
