import { useContext, useEffect } from 'react'
import { sortByDateAndTime } from '@/utils/sorting'

import Match from '@/components/Match'

import '@/styles/team-matches.css'
import { useTeamData } from '@/query'
import { Typography, Switch, FormControlLabel } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router'
import { AllMatchesContext } from '../TeamLayout'

export default function TeamMatches({ future }: { future: boolean }) {
  const { data } = useTeamData()
  const navigate = useNavigate()
  const allMatches = useSearchParams()[0].get('allMatches') === 'true'
  const { setAllMatches } = useContext(AllMatchesContext)
  setAllMatches(allMatches)

  useEffect(() => {
    if (data?.fullTeamName) {
      document.title = `${future ? 'Programma' : 'Uitslagen'} - ${data.fullTeamName}`
    }
  }, [future, data?.fullTeamName])

  if (!data) {
    return null
  }

  let matches = data.poules.flatMap(poule => poule.matches)
  if (future) {
    matches = matches.filter(match => match.status.waarde !== 'gespeeld')
    matches = matches.sort(sortByDateAndTime)
  }
  else {
    matches = matches.filter(match => match.status.waarde === 'gespeeld')
    matches = matches.sort(sortByDateAndTime).reverse()
  }

  if (!allMatches) {
    matches = matches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem', width: '100%', viewTransitionName: future ? 'team-matches-future' : 'team-matches-past' }}>
      <div className="matches-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FormControlLabel
          control={(
            <Switch
              checked={allMatches}
              onChange={() => navigate(`?allMatches=${!allMatches}`, { replace: true, viewTransition: true })}
            />
          )}
          label={future ? 'Alle wedstrijden tonen' : 'Alle uitslagen tonen'}
          labelPlacement="start"
        />
        <Typography variant="body1" fontWeight={300}>
          Klik op een wedstrijd voor meer informatie
        </Typography>
      </div>
      <div className="matches-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {matches.map(match => (
          <Match
            teamName={data.poules.find(poule => poule.name === match.pouleName)!.omschrijving}
            key={match.uuid}
            match={match}
            result={!future}
          />
        ))}
      </div>
    </div>
  )
}
