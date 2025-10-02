import { useParams } from "react-router"
import { Link } from "@mui/material"
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Stack } from "@mui/material"
import { Link as RouterLink } from "react-router"

import Match from "../../components/Match"

export default function TeamOverviewProgram({ data }: { data: any }) {
	const { clubId, teamType, teamId } = useParams<{
		clubId: string
		teamType: string
		teamId: string
	}>();

	if (!data) return null;

	const nextMatch = getNextMatch(data);

	const btModelForPoule = data.bt[nextMatch?.pouleName];
	const pouleForNextMatch = data.poules.find((poule: any) => poule.name === nextMatch?.pouleName);
	const pointMethod = pouleForNextMatch?.puntentelmethode;
	console.log('pm', pointMethod)
	const predictions = btModelForPoule.matchBreakdown(nextMatch?.teams[0].omschrijving, nextMatch?.teams[1].omschrijving, pointMethod);

	return (
		<>
			<Stack alignItems="center" direction="row" gap={1}>
				<EventNoteIcon fontSize="large"/>
				<Link variant='h4' sx={{ display: 'block' }} component={RouterLink} to={`/team/${clubId}/${teamType}/${teamId}/program`}>Programma</Link>
			</Stack>
			<Link variant='h6' gutterBottom sx={{ display: 'block' }} component={RouterLink} to={`/team/${clubId}/${teamType}/${teamId}/next-match`}>Volgende wedstrijd</Link>
			<Match match={nextMatch} predictions={predictions} />
		</>
	)
}

function getNextMatch(data: any) {
	const now = new Date();
	const allMatches = data.poules.flatMap((poule: any) => poule.matches);
	const futureMatches = allMatches.filter((match: any) => new Date(match.datum) > now);
	const futureMatchesForTeam = futureMatches.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	const sortedFutureMatchesForTeam = futureMatchesForTeam.sort((a: any, b: any) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
	return sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null;
}