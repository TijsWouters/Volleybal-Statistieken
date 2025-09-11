import { useState, useEffect } from 'react';
import { parse } from 'node-html-parser';

export default function useTeam({ clubId, teamType, teamId }: { clubId: string; teamType: string; teamId: string }) {

	const [team, setTeam] = useState(null);
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