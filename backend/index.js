import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

let fetchCounter = 0;

function countedFetch(...args) {
	fetchCounter++;
	return fetch(...args);
}

const app = express();
const port = 3000;

app.use(cors({
	origin: 'http://localhost:5173'  // your Vite server origin
}));

app.get('/search', async (req, res) => {
	const que = req.query.q;

	const requestBody = {
		q: que,
		type: 'competition',
		exclude: '',
	}

	const response = await countedFetch(`https://www.volleybal.nl/api/search`, {
		method: 'POST',
		body: JSON.stringify(requestBody),
		headers: {
			'Content-Type': 'application/json'
		}
	})

	res.send(await response.json());
});

app.get('/team/:clubId/:teamType/:teamId', async (req, res) => {
	const { clubId, teamType, teamId } = req.params;
	const fetchCounterBefore = fetchCounter;

	const matches = await getTeamInfo(clubId, teamType, teamId);
	console.log(`Fetched ${fetchCounter - fetchCounterBefore} times from Nevobo API for team ${clubId} ${teamType} ${teamId}`);
	res.send(matches);
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

async function getTeamInfo(clubId, teamType, teamId) {
	const poules = await getPoulesAndMatches(clubId, teamType, teamId);
	const club = await getClubInfo(clubId);

	return {
		club,
		poules
	};
}

async function getClubInfo(clubId) {
	const response = await countedFetch(`https://api.nevobo.nl/relatiebeheer/verenigingen/${clubId}`)
	const data = await response.json();
	return data;
}

async function getPoulesAndMatches(clubId, teamType, teamId) {
	const poules = await getPoules(clubId, teamType, teamId);

	const poulesWithNames = await addNamesToPoules(poules);
	const poulesWithTeams = await addTeamsToPoules(poulesWithNames);
	const poulesWithMatches = await addMatchesToPoules(poulesWithTeams);
	
	return 	poulesWithMatches;
}

// We can query 30 matches per page

async function addMatchesToPoules(poules) {
	return Promise.all(poules.map(async p => {
		const firstResponse = await countedFetch(`https://api.nevobo.nl/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}`);
		const firstJson = await firstResponse.json();
		const totalMatches = firstJson['hydra:totalItems'];

		const totalPages = Math.ceil(totalMatches / 30);

		const matches = firstJson['hydra:member'];
		const fetches = [];
		for (let page = 2; page <= totalPages; page++) {
			fetches.push(countedFetch(`https://api.nevobo.nl/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}&page=${page}`));
		}

		const extraRequests = (await Promise.all(fetches));
		const allJson = await Promise.all(extraRequests.map(r => r.json()));
		allJson.forEach(m => matches.push(...m['hydra:member']));

		p.matches = await addTeamDataToMatches(p, matches);
		p.matches.forEach(m => m.pouleName = p.name);
		return p;
	}));
}

async function addTeamDataToMatches(poule, matches) {
	for (const match of matches) {
		const homeTeam = match.teams[0];
		const awayTeam = match.teams[1];
		const homeData = poule.teams.find(t => t['@id'] === homeTeam);
		const awayData = poule.teams.find(t => t['@id'] === awayTeam);
		match.teams = [homeData, awayData];
	}
	return matches;
}

async function addNamesToPoules(poules) {
	return Promise.all(poules.map(async p => {
		const response = await countedFetch(`https://api.nevobo.nl${p.poule}`);
		const pouleData = await response.json();
		p.name = pouleData.omschrijving;
		p.puntentelmethode = pouleData.puntentelmethode;
		return p;
	}));
}

async function getPoules(clubId, teamType, teamId) {
	const response = await countedFetch(`https://api.nevobo.nl/competitie/pouleindelingen?team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}`)
	const data = await response.json();
	return data['hydra:member'];
}

async function addTeamsToPoules(poules) {
	return Promise.all(poules.map(async p => {
		const response = await countedFetch(`https://api.nevobo.nl/competitie/pouleindelingen?poule=${p.poule}`);
		const data = await response.json();
		p.teams = data['hydra:member'];
		return p;
	}));
}