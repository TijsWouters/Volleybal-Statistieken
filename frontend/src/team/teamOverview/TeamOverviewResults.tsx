import { Link } from "@mui/material"
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Stack } from "@mui/material"
import { useParams } from "react-router"

import Match from "../../components/Match"

export default function TeamOverviewProgram({ data }: { data: any }) {
	const { clubId, teamType, teamId } = useParams<{
		clubId: string
		teamType: string
		teamId: string
	}>();

	if (!data) return null;

	const lastMatch = getLastMatch(data);

	const btModelForPoule = data.bt[lastMatch?.pouleName];
	const pouleForLastMatch = data.poules.find((poule: any) => poule.name === lastMatch?.pouleName);
	const pointMethod = pouleForLastMatch?.puntentelmethode;
	console.log('pm', pointMethod)
	const predictions = btModelForPoule.matchBreakdown(lastMatch?.teams[0].omschrijving, lastMatch?.teams[1].omschrijving, pointMethod);

	return (
		<>
			<Stack alignItems="center" direction="row" gap={1}>
				<EmojiEventsIcon fontSize="large"/>
				<Link variant='h4' sx={{ display: 'block' }}>Uitslagen</Link>
			</Stack>
			<Link variant='h6' gutterBottom sx={{ display: 'block' }}>Vorige wedstrijd</Link>
			<Match match={lastMatch} result predictions={predictions}/>
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
