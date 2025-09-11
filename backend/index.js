import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';


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

	const response = await fetch(`https://www.volleybal.nl/api/search`, {
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

	const date = new Date().toISOString().split('T')[0];

	const poulesResponse = await fetch(`https://api.nevobo.nl/competitie/pouleindelingen?team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}`)

	const poulesJson = await poulesResponse.json();

	const poules = poulesJson['hydra:member'];

	const pouleRequestURLs = poules.map(p => p.poule);

	const pouleResponses = await Promise.all(pouleRequestURLs.map(url => fetch(`https://api.nevobo.nl${url}`)));

	const pouleJsons = await Promise.all(pouleResponses.map(r => r.json()));

	const response = await fetch(`https://api.nevobo.nl/competitie/wedstrijden?order%5Bbegintijd%5D=asc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&datum%5Bafter%5D=${date}`)

	const json = await response.json();

	const matches = json['hydra:member']

	const idToTeamMap = await createIdToTeamMap(matches);

	console.log(pouleJsons)

	const result = matches.map(match => {
		return {
			date: match.datum,
			time: match.tijdstip,
			homeTeam: idToTeamMap.get(match.teams[0]),
			awayTeam: idToTeamMap.get(match.teams[1]),
			poule: pouleJsons.find(p => match.poule === p['@id'])?.omschrijving,
		};
	});

	res.send(result);
})

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});


// Take the responses from the fetch call for matches and create a map from team ID (in this competition) to team name
async function createIdToTeamMap(matches) {
	const allTeamsURLs = matches.flatMap(m => m.teams);

	const teams = await Promise.all(allTeamsURLs.map(async url => {
		const response = await fetch(`https://api.nevobo.nl${url}`);
		const json = await response.json();
		return json;
	}));

	const idToTeamMap = new Map();
	teams.forEach(team => {
		idToTeamMap.set(team['@id'], team.omschrijving);
	});

	return idToTeamMap;
}