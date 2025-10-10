import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { BarChart } from '@mui/x-charts'
import type { Match } from 'types'

export default function Match({ match, result = false, prediction }: { match: Match | null, result?: boolean, prediction: Record<string, string> | null, predictionPossible?: boolean }) {
  if (!match) {
    return <Typography variant="body1">Geen {result ? "vorige" : "volgende"} wedstrijd gevonden</Typography>
  }
  
  const formattedDate = dayjs(match.datum).format('D MMMM YYYY')

  return (
    <Box sx={{ backgroundColor: 'var(--purple-90)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', maxWidth: 'fit-content' }}>
      <Typography variant="h6">{formattedDate}</Typography>
      <Typography variant="subtitle1">{match?.pouleName}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto 1fr 2fr', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0', height: '3.5rem', justifyItems: 'center' }}>
        <Typography variant="h6" sx={{ textAlign: 'right' }}>
          {match?.teams[0].omschrijving}
        </Typography>
        <TeamImage match={match} teamIndex={0} />
        <Typography
          variant="h5"
          sx={{ display: 'inline', margin: '0 1rem', textAlign: 'center', backgroundColor: 'var(--purple-30)', padding: '0.7rem', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}
        >
          {result ? match.eindstand![0] + ' - ' + match.eindstand![1] : dayjs(match?.tijdstip, 'HH:mm').format('HH:mm')}
        </Typography>
        <TeamImage match={match} teamIndex={1} />
        <Typography variant="h6" sx={{ textAlign: 'left' }}>
          {match?.teams[1].omschrijving}
        </Typography>
      </Box>
      {result && <SetStanden match={match} />}
      {!result && <MatchPredictionsBarChart prediction={prediction!} />}
    </Box>
  )
}

function MatchPredictionsBarChart({ prediction }: { prediction: Record<string, string> | null }) {
  return (
    !prediction
      ? <Typography variant="body2" color="error">Niet genoeg data om voorspelling te maken</Typography>
      : (
          <Box sx={{ width: '100%', color: 'white' }} className="match-predictions">
            <BarChart
              series={mapResultChancesToSeries(prediction)}
              xAxis={mapResultChancesToXAxis(prediction)}
              height={175}
              borderRadius={10}
              barLabel={v => `${v.value}%`}
              hideLegend
              colors={['var(--purple-30)']}
              loading={false}
              sx={{ color: 'white' }}
            />
          </Box>
        ))
}

function SetStanden({ match }: { match: Match }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
      {match?.setstanden?.map((set) => (
        <Box key={set.set} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              backgroundColor: 'var(--purple-60)',
              paddingTop: '0.65rem',
              paddingBottom: '0.6rem',
              paddingLeft: '0.6rem',
              paddingRight: '0.6rem',
              borderRadius: '12px',
              color: 'white',
              lineHeight: 1,
            }}
          >
            {set.puntenA > set.puntenB ? <strong>{set.puntenA}</strong> : set.puntenA}
            {' '}
            -
            {' '}
            {set.puntenB > set.puntenA ? <strong>{set.puntenB}</strong> : set.puntenB}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  return (
    <img
      style={{ height: '3.5rem', width: '100px', objectFit: 'contain', backgroundColor: 'white', padding: '0.2rem', borderRadius: '1rem', border: '1px solid #ccc' }}
      src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
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
