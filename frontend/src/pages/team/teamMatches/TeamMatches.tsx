import { useEffect } from 'react'
import { sortByDateAndTime } from '@/utils/sorting'

import Match from '@/components/Match'

import '@/styles/team-matches.css'
import { useTeamData } from '@/query'

export default function TeamMatches({ future }: { future: boolean }) {
  const { data } = useTeamData()

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

  matches = matches.filter(match => match.teams.some(team => team.omschrijving === data.fullTeamName))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem', width: '100%' }}>
      <div className="matches-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
