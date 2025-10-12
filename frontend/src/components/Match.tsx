import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { BarChart } from '@mui/x-charts'
import type { Match } from 'types'

export default function Match({ match, result = false }: { match: Match | null, result?: boolean }) {
  if (!match) {
    return <Typography variant="body1">Geen {result ? "vorige" : "volgende"} wedstrijd gevonden</Typography>
  }

  const formattedDate = dayjs(match.datum).format('dddd D MMMM YYYY')

  return (
    <Box className="match" key={match.uuid}>
      <Typography variant="h6">{formattedDate}</Typography>
      <Typography variant="subtitle1">{match?.pouleName}</Typography>
      <Box className="match-teams-and-result-or-time">
        <div className="team-name-and-logo left-team">
          <Typography variant="h6" className="team-name">
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          className="match-result-or-time"
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : dayjs(match?.tijdstip, 'HH:mm').format('H:mm')}
        </Typography>
        <div className="team-name-and-logo right-team">
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className="team-name">
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </Box>
      {result && <SetStanden match={match} />}
      {!result && <MatchPredictionsBarChart prediction={match.prediction!} />}
    </Box>
  )
}

function MatchPredictionsBarChart({ prediction }: { prediction: Record<string, string> | null }) {
  return (
    !prediction
      ? <Typography variant="body2" color="error">Niet genoeg data om voorspelling te maken</Typography>
      : (
        <Box sx={{ width: '100%' }} className="match-predictions">
          <BarChart
            skipAnimation
            series={mapResultChancesToSeries(prediction)}
            xAxis={mapResultChancesToXAxis(prediction)}
            height={175}
            borderRadius={10}
            barLabel={v => v.value! < 10 ? '' : `${v.value}%`}
            hideLegend
            colors={['var(--purple-30)']}
            loading={false}
          />
        </Box>
      ))
}

function SetStanden({ match }: { match: Match }) {
  return (
    <Box className="sets-container">
      {match?.setstanden?.map((set) => (
        <Box key={set.set} className="set">
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
        </Box>
      ))}
    </Box>
  )
}

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  return (
    <img
      className="team-logo"
      src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
      loading='lazy'
    />
  )
}

// Helper functions to create predictions bar chart
function mapResultChancesToSeries(resultChances: Record<string, string> | undefined) {
  if (!resultChances) return []
  return [{ data: Object.values(resultChances).map(Number), label: 'Kans (%)' }]
}

function mapResultChancesToXAxis(resultChances: Record<string, string> | undefined) {
  if (!resultChances) return []
  return [{ data: Object.keys(resultChances) }]
}

function getTeamImageURL(team: string) {
  const parts = team.split('/')
  const clubId = parts[3]
  return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`
}
