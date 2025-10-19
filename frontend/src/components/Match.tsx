import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import { BarChart } from '@mui/x-charts'
import { ViewportGate } from './ViewportGate'
import { useEffect, useState } from 'react'

export default function Match({ match, teamName, result = false }: { match: Match, teamName: string, result?: boolean }) {
  const [useShort, setUseShort] = useState(window.innerWidth < 460)

  useEffect(() => {
    function handleResize() {
      setUseShort(window.innerWidth < 460)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const formattedDate = dayjs(match.datum).format('dddd D MMMM YYYY')
  let neutral, teamDidWin
  if (match.teams[0].omschrijving === teamName && result) teamDidWin = match.eindstand ? match.eindstand[0] > match.eindstand[1] : undefined
  if (match.teams[1].omschrijving === teamName && result) teamDidWin = match.eindstand ? match.eindstand[1] > match.eindstand[0] : undefined
  if (teamDidWin === undefined) neutral = true

  let teamSide: 'left' | 'right' | null = null
  if (match.teams[0].omschrijving === teamName) teamSide = 'left'
  if (match.teams[1].omschrijving === teamName) teamSide = 'right'

  return (
    <div className="match" key={match.uuid}>
      <Typography align='center' variant="h6" className='date'>{formattedDate}</Typography>
      <Typography align='center' variant="subtitle1" className='poule'>{match?.pouleName}</Typography>
      <div className="match-teams-and-result-or-time">
        <div className="team-name-and-logo left-team">
          <Typography variant="h6" className="team-name">
            {match?.teams[0].omschrijving}
          </Typography>
          <TeamImage match={match} teamIndex={0} />
        </div>
        <Typography
          variant="h5"
          className={`match-result-or-time ${neutral ? 'neutral' : (teamDidWin ? 'won' : 'lost')}`}
        >
          {result ? match.eindstand![0] + '-' + match.eindstand![1] : dayjs(match?.tijdstip, 'HH:mm').format('H:mm')}
        </Typography>
        <div className="team-name-and-logo right-team">
          <TeamImage match={match} teamIndex={1} />
          <Typography variant="h6" className="team-name">
            {match?.teams[1].omschrijving}
          </Typography>
        </div>
      </div>
      {result && <SetStanden match={match} teamName={teamName} />}
      {!result && <MatchPredictionsBarChart prediction={match.prediction!} useShort={useShort} teamSide={teamSide} />}
    </div>
  )
}

function MatchPredictionsBarChart({ prediction, useShort, teamSide }: { prediction: Record<string, number> | null, useShort: boolean, teamSide: 'left' | 'right' | null }) {
  return (
    !prediction
      ? <Typography align='center' variant="body2" color="darkred">Niet genoeg data om voorspelling te maken</Typography>
      : (
        <div className="match-prediction">
          <ViewportGate estimatedHeight={175} once={true} keepMounted={true} renderOnIdle={true} margin="200px 0px">
            <BarChart
              skipAnimation
              series={mapResultChancesToSeries(prediction)}
              xAxis={mapResultChancesToXAxis(prediction, teamSide)}
              yAxis={[{}]}
              height={175}
              borderRadius={10}
              barLabel={v => v.value! < 10 ? '' : `${useShort ? Math.round(v.value!) : v.value?.toFixed(1)}%`}
              hideLegend
              loading={false}
            />
          </ViewportGate>
        </div>
      ))
}

function SetStanden({ match, teamName }: { match: Match, teamName: string }) {
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

function TeamImage({ match, teamIndex }: { match: Match, teamIndex: number }) {
  return (
    <img
      className="team-logo"
      src={match ? getTeamImageURL(match.teams[teamIndex].team) : undefined}
      loading='lazy'
      alt={`${match.teams[teamIndex].omschrijving}`}
    />
  )
}

// Helper functions to create predictions bar chart
function mapResultChancesToSeries(resultChances: Record<string, number> | undefined) {
  if (!resultChances) return []
  return [{ data: Object.values(resultChances).map(Number), label: 'Kans (%)' }]
}

function mapResultChancesToXAxis(resultChances: Record<string, number> | undefined, teamSide: 'left' | 'right' | null) {
  if (!resultChances) return []
  return [{ data: Object.keys(resultChances), colorMap: createColorMap(Object.keys(resultChances), teamSide) }]
}

function createColorMap(results: string[], teamSide: 'left' | 'right' | null): { colors: string[], type: 'ordinal' } {
  const colors = [];
  const sortedResults = [...results].sort((a, b) => {
    const [a1, a2] = a.split('-').map(Number);
    const [b1, b2] = b.split('-').map(Number);
    return (a1 - a2) - (b1 - b2);
  });

  for (const result of sortedResults) {
    colors.push(resultToColor(result, teamSide));
  }

  return {
    colors,
    type: 'ordinal'
  };
}

function resultToColor(result: string, teamSide: 'left' | 'right' | null = null): string {
  if (!teamSide) return 'var(--purple-30)';
  const [scoreA, scoreB] = result.split('-').map(Number);
  const totalSets = scoreA + scoreB;
  const aPercentage = (scoreA / totalSets) * 100;

  if (teamSide === 'right') return percentageToColor(aPercentage);
  if (teamSide === 'left') return percentageToColor((100 - aPercentage));
  return 'var(--purple-30)';
}

// #006400
// #8B0000
function percentageToColor(p: number) {
  const maxG = 130;
  const maxR = 159;

  let r, g = 0
  if (p < 50) {
    r = maxR
    g = Math.round(maxG/50 * p)
  }
  else {
    g = maxG
    r = Math.round(maxR * 2 - (2*maxR /100) * p)
  }
  const h = r * 0x10000 + g * 0x100
  return '#' + ('000000' + h.toString(16)).slice(-6)
}

function getTeamImageURL(team: string) {
  const parts = team.split('/')
  const clubId = parts[3]
  return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`
}
