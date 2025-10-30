import { Typography } from '@mui/material'

export default function SetResults({ match, teamName }: { match: Match, teamName: string }) {
  return (
    <div className="sets-container">
      {match?.setstanden?.map((set) => {
        let teamIndex, neutral
        if (match.teams[0].omschrijving === teamName) teamIndex = 'puntenA'
        if (match.teams[1].omschrijving === teamName) teamIndex = 'puntenB'
        if (!teamIndex) neutral = true
        const otherTeamIndex = teamIndex === 'puntenB' ? 'puntenA' : 'puntenB'

        return (
          <div key={set.set} className={`set ${neutral ? '' : (set[teamIndex!] > set[otherTeamIndex!] ? 'won' : 'lost')}`}>
            <Typography
              variant="body1"
              className="match-set"
            >
              {set.puntenA > set.puntenB ? <u>{set.puntenA}</u> : set.puntenA}
              {' '}
              -
              {' '}
              {set.puntenB > set.puntenA ? <u>{set.puntenB}</u> : set.puntenB}
            </Typography>
          </div>
        )
      })}
    </div>
  )
}
