import { LLMOutput } from '@/components/LLMOutput'
import { useMatchSummaryOrPreview } from '@/hooks/useLLM'

export default function MatchSummaryOrPreview({ match }: { match: DetailedMatchInfo }) {
  const summary = useMatchSummaryOrPreview(match)

  const loadingText = match.eindstand ? 'Samenvatting wordt gegenereerd...' : 'Voorbeschouwing wordt gegenereerd...'

  return (
    <LLMOutput text={summary.data} loadingText={loadingText} />
  )
}
