import { Grid, Stack, Paper, Link } from "@mui/material"
import { useParams } from "react-router"
import TeamInfo from "./TeamInfo"
import TeamOverviewProgram from "./TeamOverviewProgram"
import TeamOverviewResults from "./TeamOverviewResults"

import { useTeamData } from "../../query"

export default function TeamOverview() {
	const { clubId, teamType, teamId } = useParams<{ clubId: string, teamType: string, teamId: string }>();

	const { data } = useTeamData(clubId!, teamType!, teamId!);

	return (
		<div className="team-overview-container">
			<Grid container sx={{ height: '100%' }} spacing={2} padding={2} justifyContent={'center'}>
				<Grid size={'auto'}>
					<Paper sx={{ height: '100%', padding: '1rem' }}>
						<TeamInfo data={data} />
					</Paper>
				</Grid>
				<Grid size={'auto'}>
					<Stack spacing={2} sx={{ height: '100%' }}>
						<Paper sx={{ flex: 1, padding: '1rem' }}>
							<TeamOverviewProgram data={data} />
						</Paper>
						<Paper sx={{ flex: 1, padding: '1rem' }}>
							<TeamOverviewResults data={data} />
						</Paper>
						<Paper sx={{ flex: 1, padding: '1rem' }}>
							<Link>Stand</Link>
						</Paper>
					</Stack>
				</Grid>
			</Grid>
		</div>
	)

}