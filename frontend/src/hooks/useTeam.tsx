import { useState, useEffect } from 'react';
import { parse } from 'node-html-parser';

export default function useTeam() {
	const pathParams = useParams() as { clubId: string; teamType: string; teamId: string };

	const [team, setTeam] = useState<Team>(null!);

	useEffect(() => {
		fetch(`http://localhost:3000/team/${pathParams.clubId}/${pathParams.teamType}/${pathParams.teamId}`, {
			method: 'GET',
		})
		.then(response => {
			if (response.ok) return response.json();
			throw new Error('Network response was not ok.');
		}).then(data => {
			
		})
	})


	
}

type Team = {
	name: string;
	club: string;
	matches: Match[];
}

type Match = {
	homeTeam: string;
	awayTeam: string;
	date: string;
	time: string;
	competition: string;
}