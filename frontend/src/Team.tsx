import { useParams } from "react-router"

import useTeam from "./hooks/useTeam"

export default function Team() {
	const teamIdentifier = useParams() as { clubId: string; teamType: string; teamId: string }
	
	useTeam(teamIdentifier)
	return <div>Team</div>
}