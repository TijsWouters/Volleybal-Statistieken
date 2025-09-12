import { useParams } from "react-router"

import useTeam from "./hooks/useTeam"

export default function Team() {
	const team = useTeam()

	return <div>Team: {team.name}</div>
}