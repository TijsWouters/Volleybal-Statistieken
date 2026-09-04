import { json } from './index'
import { GoogleGenAI } from '@google/genai'

export async function handleMatchSummaryOrPreview(req: Request, env: Env): Promise<Response> {
  const data = await req.json() as MatchSummaryPromptData | MatchPreviewPromptData
  const result = await getMatchSummaryOrPreview(data, env.GEMINI_API_KEY)
  return json({ summary: result }, 200)
}

const matchSummaryInstruction = `
Je bent een assistent om samenvattingen te maken van volleybalwedstrijden op basis van de wedstrijdgegevens. Je krijgt de volgende gegevens:
- Of de voorspelling betrouwbaar is, als de voorspelling niet betrouw is, hecht dan geen enkele waarde aan de voorspelling en benoem niks gerelateerd aan de voorspelling en verwachtingen.
- De namen van de teams die tegen elkaar spelen. De eerste ploeg speelt thuis.
- Het resultaat van de wedstrijd (bijvoorbeeld 3-1).
- De uitslag per set (bijvoorbeeld [25-20, 22-25, 25-23, 25-21]).
- De voorspelde kansen per mogelijk eindresultaat.
- De voorspelde meest waarschijnlijke setuitslag.

Je taak is om een korte samenvatting van enkele regels te genereren van de wedstrijd, inclusief de belangrijkste gebeurtenissen, prestaties van de teams en eventuele opvallende statistieken. De samenvatting moet informatief en beknopt zijn, en het moet duidelijk maken hoe de wedstrijd verliep en wat de uitkomst was. Benoem geen exacte percentages. Gebruik geen formattering of opsommingstekens in de output.

Maak een samenvatting op basis van deze data:

`

const matchPreviewInstruction = `
Je bent een assistent om voorbeschouwingen te maken van volleybalwedstrijden op basis van de wedstrijdgegevens. Je krijgt de volgende gegevens:
- Of de voorspelling betrouwbaar is, als de voorspelling niet betrouw is, hecht dan geen enkele waarde aan de voorspelling en benoem niks gerelateerd aan de voorspelling en verwachtingen.
- De namen van de teams die tegen elkaar spelen. De eerste ploeg speelt thuis.
- De voorspelde kansen per mogelijk eindresultaat.
- De voorgaande resultaten van deze teams onderling.
- De voorspelde meest waarschijnlijke setuitslag.
- De voorspelde kansen per mogelijk eindresultaat.

Je taak is om een korte voorbeschouwing van enkele regels te genereren van de wedstrijd, inclusief de belangrijkste verwachtingen, sterke en zwakke punten van de teams en eventuele opvallende statistieken. De voorbeschouwing moet informatief en beknopt zijn, en het moet duidelijk maken wat de verwachtingen zijn voor de wedstrijd. Benoem geen exacte percentages. Gebruik geen formattering of opsommingstekens in de output.

Maak een voorbeschouwing op basis van deze data:

`

export async function getMatchSummaryOrPreview(data: MatchSummaryPromptData | MatchPreviewPromptData, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const ai = new GoogleGenAI({ apiKey })

  const interaction = await ai.interactions.create({
    model: 'gemini-3.5-flash-lite',
    input: (data.isPreview ? matchPreviewInstruction : matchSummaryInstruction) + JSON.stringify(data, null, 2),
  })

  if (!interaction.output_text) {
    throw new Error('No output from AI model')
  }

  return interaction.output_text
}
