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

app.get('/team/:clubId/:teamType/:teamId/matches', async (req, res) => {
	const { clubId, teamType, teamId } = req.params;

	const matches = await getMatches(clubId, teamType, teamId);
	res.send(matches);
});

app.get('/team/:clubId/:teamType/:teamId/results', async (req, res) => {
	const { clubId, teamType, teamId } = req.params;

	const results = await getResults(teamId, teamType, clubId);
	res.send(results);
});

app.get('/club/:clubId', async (req, res) => {
	const { clubId } = req.params;
	const clubInfo = await getClubInfo(clubId);
	res.send(clubInfo);
});

app.get('/location/:locationId', async (req, res) => {
	const { locationId } = req.params;
	const locationInfo = await getLocationInfo(locationId);
	res.send(locationInfo);
});

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

function getTeamName(poules) {
	return poules[0].omschrijving;
}

async function getClubInfo(clubId) {
	const response = await fetch(`https://api.nevobo.nl/relatiebeheer/verenigingen/${clubId}`)
	const data = await response.json();

	const result = {
		name: data.naam,
		longitude: data.lengtegraad,
		latitude: data.breedtegraad,
		province: data.provincie,
		muncipality: data.gemeente,
		website: data.website,
	}

	return result;
}

function constructPouleMap(poules) {
	const map = new Map();
	poules.forEach(p => {
		map.set(p['@id'], p.omschrijving);
	});
	return map;
}

async function getMatches(clubId, teamType, teamId) {
	const date = new Date().toISOString().split('T')[0];
	const response = await fetch(`https://api.nevobo.nl/competitie/wedstrijden?order%5Bbegintijd%5D=asc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&datum%5Bafter%5D=${date}`)
	const data = await response.json()['hydra:member'];

	const pouleMap = constructPouleMap(data);

	const result = data.map(match => {
		return {
			date: match.datum,
			time: match.tijdstip,
			homeTeam: match.thuisteam,
			awayTeam: match.uitteam,
			competition: pouleMap.get(match.poule) || 'Onbekend',
		}
	})

	return result;
}

async function constructPouleMap(matches) {
	const pouleIds = new Set(matches.map(m => m.poule));

	const poules = await Promise.all(Array.from(pouleIds).map(id => {
		const response = fetch(`https://api.nevobo.nl${id}`);
		const json = response.json();
		return json;
	}));

	const pouleMap = new Map();
	poules.forEach(p => {
		pouleMap.set(p['@id'], p.omschrijving);
	});

	return pouleMap;
}

async function constructTeamMap(matches) {
	const teamIds = new Set(matches.flatMap(m => m.teams));

	const teams = await Promise.all(Array.from(teamIds).map(id => {
		const response = fetch(`https://api.nevobo.nl${id}`);
		const json = response.json();
		return json;
	}));

	const teamMap = new Map();
	teams.forEach(t => {
		teamMap.set(t['@id'], t.omschrijving);
	});

	return teamMap;
}

async function getLocationInfo(locationId) {
	const response = await fetch(`https://api.nevobo.nl/accommodatie/sporthallen/${locationId}`);
	const data = await response.json();

	return {
		name: data.naam,
		longitude: data.adres.lengtegraad,
		latitude: data.adres.breedtegraad,
		address: data.adres.straat + ' ' + data.adres.huisnummer + ', ' + data.adres.postcode + ' ' + data.adres.plaats,
	}
}

async function getResults(teamId, teamType, clubId, teamMap) {
	const date = new Date().toISOString().split('T')[0];
	const response = await fetch(`https://api.nevobo.nl/competitie/wedstrijden?order%5Bbegintijd%5D=desc&team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}&datum%5Bbefore%5D=${date}`)
	const data = await response.json();

	return data['hydra:member'].map(match => {
		return {
			homeTeam: teamMap.get(match.teams[0]) || 'Onbekend',
			awayTeam: teamMap.get(match.teams[1]) || 'Onbekend',
			id: match['@id'],
			date: match.datum,
			time: match.tijdstip,
			result: match.eindstand,
			sets: match.setstanden.map(s => {
				return {
					set: s.set,
					home: s.puntenA,
					away: s.puntenB
				}
			})
		}
	})
}