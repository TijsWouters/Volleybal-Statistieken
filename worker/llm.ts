import { json } from './index'
import { GoogleGenAI } from '@google/genai'

const LLM_CACHE_TTL_SECONDS = 12 * 60 * 60

export async function handleMatchSummaryOrPreview(req: Request, env: Env): Promise<Response> {
  const data = await req.json() as MatchSummaryPromptData | MatchPreviewPromptData
  const cacheKey = await getCacheKey(data)

  try {
    const cached = await env.VOLLEYBAL_STATISTIEKEN_KV.get(cacheKey, 'json') as LLMApiResponse | null
    if (cached) {
      return json({ summary: cached }, 200)
    }
  }
  catch (error) {
    console.error('LLM cache read failed:', error)
  }

  const result = await getMatchSummaryOrPreview(data, env.GEMINI_API_KEY)

  try {
    await env.VOLLEYBAL_STATISTIEKEN_KV.put(cacheKey, JSON.stringify(result), {
      expirationTtl: LLM_CACHE_TTL_SECONDS,
    })
  }
  catch (error) {
    console.error('LLM cache write failed:', error)
  }

  return json({ summary: result, cached: false }, 200)
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return `{${Object.keys(object)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
      .join(',')}}`
  }

  return JSON.stringify(value) ?? 'null'
}

async function getCacheKey(data: MatchSummaryPromptData | MatchPreviewPromptData): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalJson(data)),
  )

  const hash = Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

  return `llm:match-summary:${hash}`
}

const matchSummaryInstruction = `
Je bent een assistent om samenvattingen te maken van volleybalwedstrijden op basis van de wedstrijdgegevens. Je krijgt de volgende gegevens:
- Of de voorspelling betrouwbaar is, als de voorspelling niet betrouw is, hecht dan geen enkele waarde aan de voorspelling en benoem niks gerelateerd aan de voorspelling en verwachtingen.
- De namen van de teams die tegen elkaar spelen. De eerste ploeg speelt thuis.
- Het resultaat van de wedstrijd (bijvoorbeeld 3-1).
- De uitslag per set (bijvoorbeeld [25-20, 22-25, 25-23, 25-21]).
- De voorspelde kansen per mogelijk eindresultaat.
- De voorspelde meest waarschijnlijke setuitslag.
- De voorgaande resultaten van beide teams in deze poule, een w betekent winst en een l betekent verlies, de betreffende wedstrijd is aangegeven met een hoofdletter.
- De naam van de locatie waar de wedstrijd plaatvond.
- De naam van de poule, om the bepalen of het een regulier competitiewedstrijd is of bijvoorbeeld een bekerwedstrijd.

Je taak is om een korte samenvatting van enkele regels te genereren van de wedstrijd, inclusief de belangrijkste gebeurtenissen, prestaties van de teams en eventuele opvallende statistieken. De samenvatting moet informatief en beknopt zijn, en het moet duidelijk maken hoe de wedstrijd verliep en wat de uitkomst was. Benoem geen exacte percentages. Gebruik geen formattering of opsommingstekens in de output. Gebruik uitsluitend informatie uit de aangeleverde gegevens.

Maak een samenvatting op basis van deze data:

`

const matchPreviewInstruction = `
Je bent een assistent om voorbeschouwingen te maken van volleybalwedstrijden op basis van de wedstrijdgegevens. Je krijgt de volgende gegevens:
- Of de voorspelling betrouwbaar is, als de voorspelling niet betrouw is, hecht dan geen enkele waarde aan de voorspelling en benoem niks gerelateerd aan de voorspelling en verwachtingen.
- De namen van de teams die tegen elkaar spelen. De eerste ploeg speelt thuis.
- De voorspelde kansen per mogelijk eindresultaat.
- De voorgaande resultaten van deze teams onderling.
- De voorspelde meest waarschijnlijke setuitslag.
- De voorgaande resultaten van beide teams in deze poule, een w betekent winst en een l betekent verlies
- De naam van de locatie waar de wedstrijd plaatsvindt.
- De naam van de poule, om the bepalen of het een regulier competitiewedstrijd is of bijvoorbeeld een bekerwedstrijd.

Je taak is om een korte voorbeschouwing van enkele regels te genereren van de wedstrijd, inclusief de belangrijkste verwachtingen, en eventuele opvallende statistieken. De voorbeschouwing moet informatief en beknopt zijn, en het moet duidelijk maken wat de verwachtingen zijn voor de wedstrijd. Benoem geen exacte percentages of dingen waar je geen data over hebt. Gebruik geen formattering of opsommingstekens in de output. Gebruik uitsluitend informatie uit de aangeleverde gegevens.

Maak een voorbeschouwing op basis van deze data:

`

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
]

export async function getMatchSummaryOrPreview(data: MatchSummaryPromptData | MatchPreviewPromptData, apiKey: string): Promise<LLMApiResponse> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const ai = new GoogleGenAI({ apiKey })

  for (const model of GEMINI_MODELS) {
    try {
      const interaction = await ai.interactions.create({
        model,
        input: (data.isPreview ? matchPreviewInstruction : matchSummaryInstruction) + JSON.stringify(data, null, 2),
      })

      if (interaction.output_text) {
        return { text: interaction.output_text, model }
      }
      else {
        throw new Error('No output from AI model')
      }
    }
    catch (error: any) {
      if (error.status === 429) {
        continue
      }
      else {
        console.error(`Error from model ${model}:`, error)
        break
      }
    }
  }

  return { text: 'Er is een fout opgetreden bij het genereren van de samenvatting of voorbeschouwing. Probeer het later opnieuw.' }
}
