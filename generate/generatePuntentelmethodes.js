import { writeFileSync } from 'fs'
import fetch from 'node-fetch'

const response = await fetch('https://api.nevobo.nl/competitie/puntentelmethodes')
const data = await response.json()

writeFileSync(new URL('../frontend/src/assets/puntentelmethodes.json', import.meta.url), JSON.stringify(data['hydra:member'], null, 2))
