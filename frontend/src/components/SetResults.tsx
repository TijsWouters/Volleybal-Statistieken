import { Typography } from '@mui/material'

type SetResultsProps = {
  match: Match
  teamName: string
}

export default function SetResults({ match, teamName }: SetResultsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full justify-center">
      {match?.setstanden?.map((set) => {
        let teamIndex, neutral
        if (match.teams[0].omschrijving === teamName) teamIndex = 'puntenA'
        if (match.teams[1].omschrijving === teamName) teamIndex = 'puntenB'
        if (!teamIndex) neutral = true
        const otherTeamIndex = teamIndex === 'puntenB' ? 'puntenA' : 'puntenB'

        const bgClass = neutral ? 'bg-[var(--color-primary)]' : set[teamIndex] > set[otherTeamIndex] ? 'bg-[var(--color-green)]' : 'bg-[var(--color-red)]'

        return (
          <div key={set.set} className={`p-1 rounded-lg text-white ${bgClass}`}>
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
