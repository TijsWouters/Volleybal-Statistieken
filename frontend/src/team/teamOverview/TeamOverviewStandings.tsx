import { useParams, Link as RouterLink } from "react-router";
import { useTeamData } from "../../query";
import { Table, TableHead, TableBody, TableRow, TableCell, Stack, Link } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function TeamOverviewStandings() {

	const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>();

	const { data, isPending } = useTeamData(clubId!, teamType!, teamId!);

	if (isPending) {
		return <div>Loading...</div>;
	}

	const poules = data.poules.toReversed();

	return (
		<>
			<Link variant='h4' sx={{ display: 'block' }} component={RouterLink} to={`/team/${clubId}/${teamType}/${teamId}/standings`}>
				<Stack alignItems="center" direction="row" gap={1}>
					<EmojiEventsIcon fontSize="large" />
					Standen
				</Stack>
			</Link>

			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Poule</TableCell>
						<TableCell>Positie</TableCell>
						<TableCell>Punten</TableCell>
						<TableCell>Gewonnen</TableCell>
						<TableCell>Verloren</TableCell>
						<TableCell>Gespeeld</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{poules.map((poule: any) => (
						<TableRow key={poule.name}>
							<TableCell>{poule.name}</TableCell>
							<TableCell>{poule.positie ? poule.positie + 'e' : '-'}</TableCell>
							<TableCell>{poule.punten}</TableCell>
							<TableCell>{poule.wedstrijdenWinst}</TableCell>
							<TableCell>{poule.wedstrijdenVerlies}</TableCell>
							<TableCell>{poule.gespeeld}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	)
}