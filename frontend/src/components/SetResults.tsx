import { Typography } from '@mui/material'

type SetResultsProps = {
  match: Match
  teamName: string
}

export default function SetResults({ match, teamName }: SetResultsProps) {
  return (
    <div className="sets-container">
      {match?.setstanden?.map((set) => {
        let teamIndex, neutral
        if (match.teams[0].omschrijving === teamName) teamIndex = 'puntenA'
        if (match.teams[1].omschrijving === teamName) teamIndex = 'puntenB'
        if (!teamIndex) neutral = true
        const otherTeamIndex = teamIndex === 'puntenB' ? 'puntenA' : 'puntenB'

        const style = {
          padding: '0.35rem',
          borderRadius: '0.5rem',
          color: 'white',
          backgroundColor: neutral ? 'var(--color-primary)' : set[teamIndex] > set[otherTeamIndex] ? 'var(--color-green)' : 'var(--color-red)',
        }

        return (
          <div key={set.set} style={style}>
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
