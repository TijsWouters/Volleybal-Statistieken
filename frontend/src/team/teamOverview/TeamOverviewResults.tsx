import EventAvailable from '@mui/icons-material/EventAvailable';
import { useParams } from "react-router"
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

	if (!data) return null;

	const lastMatch = getLastMatch(data);

	return (
		<>
			<LinkWithIcon variant='h4' to={`/team/${clubId}/${teamType}/${teamId}/results`} icon={<EventAvailable fontSize="large" />} text="Uitslagen" />
			<LinkWithIcon variant='h6' to={`/team/${clubId}/${teamType}/${teamId}/last-match`} text="Vorige wedstrijd" />
			<Match match={lastMatch} result />
		</>
	)
}

function getLastMatch(data: any) {
	const allMatches = data?.poules.flatMap((poule: any) => poule.matches) || [];
	const now = new Date();
	const pastMatches = allMatches.filter((match: any) => new Date(match.datum) < now && match.status.waarde === 'gespeeld');
	const pastMatchesForTeam = pastMatches.filter((match: any) => match.teams.some((team: any) => team.omschrijving === data.fullTeamName));
	const sortedPastMatchesForTeam = pastMatchesForTeam.sort((a: any, b: any) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
	return sortedPastMatchesForTeam.length > 0 ? sortedPastMatchesForTeam[0] : null;
}
