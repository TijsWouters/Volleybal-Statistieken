import { Accordion, AccordionSummary, AccordionDetails, Typography, Link } from "@mui/material";
import TEAM_TYPES from '@/assets/teamTypes.json'
import { ExpandMore } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";

export default function ClubTeams({ teams }: { teams: TeamForClub[]}) {
	const teamByType = groupTeamsByType(teams);
	return (
		<div className="teams">
			<Typography variant="h3" gutterBottom>
				Teams
			</Typography>
			{Object.entries(teamByType).map(([type, teams]) => (
				<Accordion key={type} className="type-accordion">
					<AccordionSummary expandIcon={<ExpandMore />}>
						<Typography variant="h6" className="type">{type}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						{teams.map(team => (
							<div key={team.naam} className="team">
								<Link className="team-link" component={RouterLink} to={getTeamUrl(team)}>
									<Typography variant="h6">{team.naam}</Typography>
								</Link>
								<Typography className='stand-tekst' key={team.naam} variant="subtitle1">{team.standpositietekst}</Typography>
							</div>
						))}
					</AccordionDetails>
				</Accordion>
			))}
		</div>
	);
}

function groupTeamsByType(teams: TeamForClub[]): { [type: string]: TeamForClub[] } {
	const acc: { [type: string]: TeamForClub[] } = {};
	for (const type of TEAM_TYPES) {
		acc[type.omschrijving] = [];
	}

	const teamsByType = teams.reduce((acc, team) => {
		if (!acc[getTeamType(team.naam)]) {
			acc[getTeamType(team.naam)] = [];
		}
		acc[getTeamType(team.naam)].push(team);
		return acc;
	}, acc);

	for (const type of TEAM_TYPES) {
		if (teamsByType[type.omschrijving].length === 0) {
			delete teamsByType[type.omschrijving];
		}
	}
	return teamsByType;
}

function getTeamType(teamName: string): string {
	const parts = teamName.split(' ');
	const afkorting = parts[parts.length - 2];
	return TEAM_TYPES.find(t => t.afkorting === afkorting)?.omschrijving || 'Onbekend';
}

function getTeamUrl(team: TeamForClub): string {
	const parts = team['@id'].split('/');
	const lastThree = parts.slice(-3).join('/');
	return `/team/${lastThree}`;
}