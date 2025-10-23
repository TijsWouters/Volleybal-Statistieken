import { writeFile } from 'fs/promises'

import fetch from 'node-fetch'

const clubs = []
function map(x) {
  return { breedtegraad: x.breedtegraad, lengtegraad: x.lengtegraad, naam: x.naam, organisatiecode: x.organisatiecode }
}

let url = 'https://api.nevobo.nl/relatiebeheer/verenigingen'
let data, response

do {
  response = await fetch(url)
  data = await response.json()
  clubs.push(...data['hydra:member'].map(map))
  url = `https://api.nevobo.nl${data['hydra:view']['hydra:next']}`
} while (data['hydra:view'] && data['hydra:view']['hydra:next'])

const clubsWithCoordinates = clubs.filter(c => c.breedtegraad && c.lengtegraad)

// Write the collected clubs to a JSON file next to this script.
try {
  await writeFile(new URL('../frontend/src/assets/clubCoordinates.json', import.meta.url), JSON.stringify(clubsWithCoordinates, null, 2), 'utf8')
  console.log('Wrote clubs to frontend/src/assets/clubCoordinates.json')
}
catch (err) {
  console.error('Failed to write clubsCoordinates.json', err)
  process.exitCode = 1
}
