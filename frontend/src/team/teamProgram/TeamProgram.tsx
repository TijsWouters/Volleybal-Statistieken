
import { Divider, Paper, Stack, Typography } from "@mui/material";
import { useTeamData } from "../../query"
import { useParams } from "react-router"
import Match from "../../components/Match";

export default function TeamProgram() {
	const { clubId, teamType, teamId } = useParams<{
		clubId: string
		teamType: string
		teamId: string
	}>();

	const { data, isPending } = useTeamData(clubId!, teamType!, teamId!);

	if (isPending) return <div>Loading...</div>;
	
	const matches = data?.poules.flatMap((poule: any) => poule.matches)
	console.log(matches)
	console.log(matches.length)
	const matchesForTeam = matches?.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	console.log(matchesForTeam.length)
	const plannedMatchesForTeam = matchesForTeam?.filter((match: any) => match.status.waarde !== 'gespeeld');
	console.log(plannedMatchesForTeam.length)
	const program = plannedMatchesForTeam?.sort((a: any, b: any) => new Date(a.datum).getTime() - new Date(b.datum).getTime()) || [];

	const predictions: any[] = [];
	for (const match of program) {
		const btModelForPoule = data.bt[match.pouleName];
		const pouleForMatch = data.poules.find((poule: any) => poule.name === match.pouleName);
		const pointMethod = pouleForMatch?.puntentelmethode;
		const matchPredictions = btModelForPoule.matchBreakdown(match.teams[0].omschrijving, match.teams[1].omschrijving, pointMethod);
		predictions.push(matchPredictions);
	}

	return (
		<Paper sx={{ padding: '1rem', maxWidth: 'fit-content' }}>
			<Typography variant="h2" sx={{ marginBottom: '1rem', textAlign: 'center' }}>Programma</Typography>
			<Typography variant="h5" sx={{ marginBottom: '1rem', textAlign: 'center' }}>{data?.fullTeamName}</Typography>
			<Divider sx={{ marginBottom: '1rem' }} />
			<Stack spacing={2} sx={{ maxWidth: 'fit-content'}}>
				{program.map((match: any, index: number) => (
					<Match key={index} match={match} predictions={predictions[index]} />
				))}
			</Stack>
		</Paper>
	)
}