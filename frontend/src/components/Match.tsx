import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { BarChart } from "@mui/x-charts";

export default function Match({ match, result = false, predictions }: { match: any, result?: boolean, predictions?: Record<string, number>, predictionPossible?: boolean }) {
	const formattedDate = match?.datum ? dayjs(match.datum).format('D MMMM YYYY') : ''

	return (
		<Box sx={{ backgroundColor: '#f9e6ff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', maxWidth: 'fit-content' }}>
			<Typography variant="h6">{formattedDate}</Typography>
			<Typography variant="subtitle1">{match?.pouleName}</Typography>
			<Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto 1fr 2fr', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0', height: '3.5rem' }}>
				<Typography
					variant="body1"
					sx={{
						textAlign: 'right',
					}}
				>
					{match?.teams[0].omschrijving}
				</Typography>
				<img
					style={{ height: '3.5rem', width: '100px', objectFit: 'contain', backgroundColor: 'white', padding: '0.2rem', borderRadius: '1rem', border: '1px solid #ccc' }}
					src={match ? getTeamImageURL(match.teams[0].team) : undefined}
				/>
				<Typography
					variant="h5"
					sx={{ display: 'inline', margin: '0 1rem', textAlign: 'center', backgroundColor: '#4d0066', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold', color: 'white' }}
				>
					{
						result ? (
							match ? match.eindstand[0] + ' - ' + match.eindstand[1] : '')
							: (
								dayjs(match?.tijdstip, 'HH:mm').format('HH:mm')
							)}
				</Typography>
				<img
					style={{ height: '3.5rem', width: '100px', objectFit: 'contain', backgroundColor: 'white', padding: '0.2rem', borderRadius: '1rem', border: '1px solid #ccc' }}
					src={match ? getTeamImageURL(match.teams[1].team) : undefined}
				/>
				<Typography
					variant="body1"
					sx={{ textAlign: 'left' }}
				>
					{match?.teams[1].omschrijving}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
				{match?.setstanden?.map((set: any) => (
					<Box key={set.set} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Typography
							variant="body2"
							sx={{
								backgroundColor: '#4d0066',
								padding: '0.5rem',
								borderRadius: '4px',
								color: 'white',
							}}
						>
							{parseInt(set.puntenA) > parseInt(set.puntenB) ? <strong>{set.puntenA}</strong> : set.puntenA} - {parseInt(set.puntenB) > parseInt(set.puntenA) ? <strong>{set.puntenB}</strong> : set.puntenB}
						</Typography>
					</Box>
				))}
			</Box>
			{!result && (
				!predictions ? <Typography variant="body2" color="error">Niet genoeg data om voorspelling te maken</Typography> : (
				<Box sx={{ width: '100%', color: 'white' }} className="match-predictions">
					<BarChart 
						series={mapResultChancesToSeries(predictions)}
						xAxis={mapResultChancesToXAxis(predictions)}
						height={175} 
						borderRadius={10}
						barLabel={v => `${v.value}%`}
						hideLegend
						colors={['#4d0066']}
						loading={false}
						sx={{ color: 'white' }}
					/>
				</Box>
			))
		}
	</Box>
)
}

function mapResultChancesToSeries(resultChances: Record<string, number> | undefined) {
	if (!resultChances) return [];
	return [{ data: Object.values(resultChances), label: 'Kans (%)' }];
}

function mapResultChancesToXAxis(resultChances: Record<string, number> | undefined) {
	if (!resultChances) return [];
	return [{ data: Object.keys(resultChances) }];
}

function getTeamImageURL(team: string) {
	const parts = team.split('/');
	const clubId = parts[3];
	return `https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`;
}