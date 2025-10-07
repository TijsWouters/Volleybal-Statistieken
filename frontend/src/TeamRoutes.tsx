import { Route, useParams, Routes } from "react-router";

import TeamOverview from './team/teamOverview/TeamOverview'
import TeamStandings from './team/teamStandings/TeamStandings'
import TeamMatches from './team/teamProgram/TeamMatches'
import { useTeamData } from './query'
import Loading from "./Loading";

export default function TeamRoutes() {
	const { clubId, teamType, teamId } = useParams<{
		clubId: string
		teamType: string
		teamId: string
	}>();

	const { isPending } = useTeamData(clubId!, teamType!, teamId!);

	if (isPending) return <Loading />;

	return (
		<Routes>
			<Route path="/" element={<TeamOverview />} />
			<Route path="/program" element={<TeamMatches future={true} />} />
			<Route path="/results" element={<TeamMatches future={false} />} />
			<Route path="/standings" element={<TeamStandings />} />
		</Routes>
	)
}