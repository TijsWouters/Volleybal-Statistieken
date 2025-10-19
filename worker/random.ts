import type { CountedFetcher, HydraResponseList } from "worker"

const init = { headers: { Accept: "application/ld+json, application/json;q=0.9, */*;q=0.1" } };

export async function getRandomTeams(kv: KVNamespace): Promise<Team[]> {
	let storedValue: string | null = null;
	try {
		storedValue = await kv.get("num_team_pages");
	} catch (e) {
		console.error("Error fetching num_team_pages from KV:", e);
	}
	const expectedNumPages = storedValue ? parseInt(storedValue, 10) : 1;
	const random = Math.floor(Math.random() * (expectedNumPages - 1)) + 1;
	const response = await fetch(`https://api.nevobo.nl/competitie/teams?page=${random}`, init);
	if (!response.ok) {
		throw new Error("Het is niet gelukt om willekeurige teams op te halen: " + response.statusText);
	}

	const data: HydraResponseList<Team> = await response.json()

	// If the API returned paging info, check the last page and update KV if it changed.
	try {
		const view = (data as any)["hydra:view"];
		const last = view && view["hydra:last"];
		if (typeof last === "string") {
			// last is a URL like '/competitie/teams?page=12' or full URL. Parse it.
			let lastUrl: URL | null = null;
			try {
				lastUrl = new URL(last, "https://api.nevobo.nl");
			} catch (e) {
				// If parsing fails, ignore and continue.
				lastUrl = null;
			}

			if (lastUrl) {
				const pageParam = lastUrl.searchParams.get("page");
				const lastPageIndex = pageParam ? parseInt(pageParam, 10) : NaN;
				if (!Number.isNaN(lastPageIndex) && lastPageIndex >= 0) {
					const actualNumPages = lastPageIndex;
					if (!storedValue || expectedNumPages !== actualNumPages) {
						await kv.put("num_team_pages", actualNumPages.toString());
						console.log(`Updated num_team_pages in KV from ${storedValue} to ${actualNumPages}`);
					}
				}
			}
		}
	} catch (e) {
		console.error("Error updating num_team_pages in KV:", e);
	}

	return data["hydra:member"];
}


