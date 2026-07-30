import { useMatchSummaryOrPreview } from '@/hooks/useLLM'

export default function MatchSummaryOrPreview({ match }: { match: DetailedMatchInfo }) {
  const summary = useMatchSummaryOrPreview(match)

  return (
    <div className="p-4">
      {summary
        ? (
            <p className="text-gray-700">{summary}</p>
          )
        : (
            <p className="text-gray-500">
              {match.eindstand ? 'Samenvatting' : 'Voorbeschouwing'}
              {' '}
              wordt gegenereerd...
            </p>
          )}
    </div>
  )
}
