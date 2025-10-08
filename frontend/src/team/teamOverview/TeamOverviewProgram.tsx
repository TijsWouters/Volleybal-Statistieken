import { useParams } from "react-router"
import EventNoteIcon from '@mui/icons-material/EventNote';

import Match from "../../components/Match"
import { useTeamData } from "../../query";
import LinkWithIcon from "../../components/LinkWithIcon";

export default function TeamOverviewProgram() {
	const { clubId, teamType, teamId } = useParams<{
		clubId: string
		teamType: string
		teamId: string
	}>();

	const { data } = useTeamData(clubId!, teamType!, teamId!);

	const nextMatch = getNextMatch(data);

	const btModelForPoule = data?.bt[nextMatch?.pouleName];
	const pouleForNextMatch = data?.poules.find((poule: any) => poule.name === nextMatch?.pouleName);
	const pointMethod = pouleForNextMatch?.puntentelmethode;
	const predictions = btModelForPoule?.matchBreakdown(nextMatch?.teams[0].omschrijving, nextMatch?.teams[1].omschrijving, pointMethod);

	return (
		<>
			<LinkWithIcon variant='h4' to={`/team/${clubId}/${teamType}/${teamId}/program`} icon={<EventNoteIcon fontSize="large" />} text="Programma" />
			<LinkWithIcon variant='h6' to={`/team/${clubId}/${teamType}/${teamId}/next-match`} text="Volgende wedstrijd" />
			<Match match={nextMatch} predictions={predictions} />
		</>
	)
}

function getNextMatch(data: any) {
	if (!data) return null;
	const now = new Date();
	const allMatches = data.poules.flatMap((poule: any) => poule.matches);
	const futureMatches = allMatches.filter((match: any) => new Date(match.datum) > now);
	const futureMatchesForTeam = futureMatches.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	const sortedFutureMatchesForTeam = futureMatchesForTeam.sort((a: any, b: any) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
	return sortedFutureMatchesForTeam.length > 0 ? sortedFutureMatchesForTeam[0] : null;
}