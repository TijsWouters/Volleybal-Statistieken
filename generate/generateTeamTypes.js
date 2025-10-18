import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

const teamTypes = [];
function map(x) { return { omschrijving: x.omschrijving, afkorting: x.afkorting }; }

let url = 'https://api.nevobo.nl/competitie/teamtypes';
let data, response;


do {
	response = await fetch(url);
	data = await response.json();
	teamTypes.push(...data['hydra:member'].map(map));
	url = `https://api.nevobo.nl${data['hydra:view']['hydra:next']}`;
} while (data['hydra:view'] && data['hydra:view']['hydra:next']);

// Write the collected team types to a JSON file next to this script.
try {
	await writeFile(new URL('../frontend/src/assets/teamTypes.json', import.meta.url), JSON.stringify(teamTypes, null, 2), 'utf8');
	console.log('Wrote teamTypes to frontend/src/assets/teamTypes.json');
} catch (err) {
	console.error('Failed to write teamTypes.json', err);
	process.exitCode = 1;
}

