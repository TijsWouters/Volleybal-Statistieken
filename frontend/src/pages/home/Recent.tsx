import SearchResultsList from "./SearchResultsList";
import { useRecent } from "@/hooks/useRecent";

export default function Recent() {
  const { recent } = useRecent();

  const error = recent.length === 0 ? 'Je hebt nog geen teams of clubs bekeken' : null;

  const recentWithUrls = recent.map((entry) => ({
    title: entry.title,
    url: `/${entry.type}/${entry.url}`,
    type: entry.type,
  }));

  return (
	<div className="recent-container">
		<SearchResultsList results={recentWithUrls.slice(0).reverse()} error={error} loading={false} />
	</div>
	
  )
}