import { Link, Stack, Typography } from "@mui/material";
import { useParams, Link as RouterLink } from "react-router";
import { useTeamData } from "../../query";
import BackLink from "../../components/BackLink";
import LocationPinIcon from '@mui/icons-material/LocationPin';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import LanguageIcon from '@mui/icons-material/Language';

export default function TeamInfo() {
	const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>();

	const { data } = useTeamData(clubId!, teamType!, teamId!);

	const numberOfPlannedMatches = calculatePlannedMatches(data);
	const { pointsWon, pointsLost, setsWon, setsLost, won, lost } = calculatePlayedMatches(data);

	console.log(data)

	return (
		<>
			<BackLink to={`/`} text={`Terug naar zoeken`} />
			<Typography variant="h3" gutterBottom color="primary">
				{data.fullTeamName}
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<LocationPinIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					{data.club.vestigingsplaats}, {data.club.provincie}
				</Stack>
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<SportsVolleyballIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					{data.club.naam}
				</Stack>
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<LanguageIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					<Link component={RouterLink} to={data.club.website} target="_blank" rel="noopener noreferrer">{data.club.website.split('://')[1]}</Link>
				</Stack>
			</Typography>
			<hr />
			<Typography variant="h6" gutterBottom>
				Geplande wedstrijden: {numberOfPlannedMatches}
			</Typography>
			<Typography variant="h6" gutterBottom>
				Gespeelde wedstrijden: {won + lost} (<span style={{ color: 'green' }}>{won}</span>/<span style={{ color: 'red' }}>{lost}</span>)
			</Typography>
			<Typography variant="h6" gutterBottom>
				Gespeelde sets: {setsWon + setsLost} (<span style={{ color: 'green' }}>{setsWon}</span>/<span style={{ color: 'red' }}>{setsLost}</span>)
			</Typography>
			<Typography variant="h6" gutterBottom>
				Gespeelde punten: {pointsWon + pointsLost} (<span style={{ color: 'green' }}>{pointsWon}</span>/<span style={{ color: 'red' }}>{pointsLost}</span>)
			</Typography>
			<hr />
			<Typography variant="h6">
				Actief in:
			</Typography>

			<ul style={{ margin: 0 }}>
				{data.poules.map((poule: any) => (
					<li key={poule.name}>
						{poule.name}
					</li>
				))}
			</ul>
			<img 
				src={`https://assets.nevobo.nl/organisatie/logo/${clubId}.jpg`} 
				alt={`Logo ${data.club.naam}`} 
				style={{ width: '100%'}}
			/>
		</>
	)
}

function calculatePlannedMatches(data: any) {
	if (!data) return 0;
	const allMatches = data.poules.flatMap((poule: any) => poule.matches);
	const plannedMatches = allMatches.filter((match: any) => match.status.waarde !== 'gespeeld');
	const matchesForTeam = plannedMatches.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	return matchesForTeam.length;
}

function calculatePlayedMatches(data: any): { pointsWon: number, pointsLost: number, setsWon: number, setsLost: number, won: number, lost: number } {
	if (!data) return { pointsWon: 0, pointsLost: 0, setsWon: 0, setsLost: 0, won: 0, lost: 0 };
	const allMatches = data.poules.flatMap((poule: any) => poule.matches);
	const playedMatches = allMatches.filter((match: any) => match.status.waarde === 'gespeeld');
	const matchesForTeam = playedMatches.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	let won = 0;
	let lost = 0;
	let setsWon = 0;
	let setsLost = 0;
	let pointsWon = 0;
	let pointsLost = 0;
	for (const match of matchesForTeam) {
		console.log(match);
		const indexInMatch = match.teams.findIndex((team: any) => team.omschrijving === data.fullTeamName);
		console.log(indexInMatch, match.eindstand);
		if (match.eindstand[indexInMatch] > match.eindstand[(1 - indexInMatch) % 2]) {
			won++;
		} else {
			lost++;
		}
		setsWon += match.eindstand[indexInMatch];
		setsLost += match.eindstand[(1 - indexInMatch) % 2];
		for (const set of match.setstanden || []) {
			pointsWon += parseInt(set[`punten${indexInMatch === 0 ? 'A' : 'B'}`]);
			pointsLost += parseInt(set[`punten${indexInMatch === 0 ? 'B' : 'A'}`]);
		}
	}
	return { pointsWon, pointsLost, setsWon, setsLost, won, lost };
}