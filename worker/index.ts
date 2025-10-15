type SearchRequest = {
  q: string;
  type: "competition";
  exclude: string;
};

type HydraResponseList<T> = {
  "hydra:member": T[];
  "hydra:totalItems": number;
};

type HydraResponse<T> = T

type NevoboSearchResponse = {
  status: string;
  data: { title: string; url: string; type: string }[];
};

class CountedFetcher {
  count = 0;
  async fetch(route: string, init?: RequestInit): Promise<Response> {
    this.count++;
    if (this.count > 50) {
      throw new Error("Voor het laden van de data voor dit team zijn meer dan 50 verzoeken nodig. Dit wordt helaas niet ondersteund.");
    }
    // Always ask for JSON-LD (Hydra) format
    init = { ...init, headers: { ...(init?.headers || {}), Accept: "application/ld+json, application/json;q=0.9, */*;q=0.1" } };
    const response = await fetch(`https://api.nevobo.nl${route}`, init);
    if (response.ok) {
      return response;
    } else {
      console.log("Nevobo API error:", response.status, response.statusText);
      throw new Error(`Het is niet gelukt om de data op te halen bij de Nevobo API`)
    }
  }
}

// Small JSON helper
function json(
  data: unknown,
  status = 200,
  headers: HeadersInit = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

// Optional: CORS helper (enable if you call this Worker directly from browsers)
function withCors(res: Response, allowedOrigin: string): Response {
  const h = new Headers(res.headers);
  // Adjust origin/headers/methods to your needs
  h.set("Access-Control-Allow-Origin", allowedOrigin);
  h.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(res.body, { status: res.status, headers: h });
}

async function getTeamInfo(clubId: string, teamType: string, teamId: string, fetcher: CountedFetcher): Promise<ApiResponse> {
  const [poules, club] = await Promise.all([
    getPoulesAndMatches(clubId, teamType, teamId, fetcher),
    getClubInfo(clubId, fetcher),
  ]);
  return { club, poules };
}

async function getClubInfo(clubId: string, fetcher: CountedFetcher): Promise<Club> {
  const response = await fetcher.fetch(`/relatiebeheer/verenigingen/${clubId}`)
  const data: Club = await response.json()
  return data
}

async function getPoulesAndMatches(clubId: string, teamType: string, teamId: string, fetcher: CountedFetcher) {
  const poules = await getPoules(clubId, teamType, teamId, fetcher);

  await Promise.all([
    addNamesToPoules(poules, fetcher),
    addTeamsToPoules(poules, fetcher),
  ]);

  return addMatchesToPoules(poules, fetcher);
}

// We can query 30 matches per page
async function addMatchesToPoules(poules: Poule[], fetcher: CountedFetcher) {
  return Promise.all(poules.map(async (p) => {
    const firstResponse = await fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}`)
    const firstJson = await firstResponse.json() as HydraResponseList<Match>
    const totalMatches = firstJson['hydra:totalItems']

    const totalPages = Math.ceil(totalMatches / 30)
    const matches = firstJson['hydra:member']
    if (totalPages > 1) {
      const fetches = []
      for (let page = 2; page <= totalPages; page++) {
        fetches.push(fetcher.fetch(`/competitie/wedstrijden?order%5Bbegintijd%5D=asc&poule=${p.poule}&page=${page}`))
      }

      const extraRequests = (await Promise.all(fetches))
      const allJson: HydraResponseList<Match>[] = await Promise.all(extraRequests.map(r => r.json())) as HydraResponseList<Match>[]
      allJson.forEach(m => matches.push(...m['hydra:member'])) // Flatten
    }
    p.matches = addTeamDataToMatches(p, matches)
    p.matches.forEach(m => m.pouleName = p.name)
    return p
  }))
}

function addTeamDataToMatches(poule: Poule, matches: Match[]): Match[] {
  for (const match of matches) {
    const homeTeam = match.teams[0] as unknown as string
    const awayTeam = match.teams[1] as unknown as string
    const homeData = poule.teams.find(t => t['@id'] === homeTeam)
    const awayData = poule.teams.find(t => t['@id'] === awayTeam)
    match.teams = [homeData!, awayData!]
  }
  return matches
}

async function addNamesToPoules(poules: Poule[], fetcher: CountedFetcher) {
  return Promise.all(poules.map(async (p) => {
    const response = await fetcher.fetch(`${p.poule}`)
    const pouleData: HydraResponse<Poule> = await response.json()
    p.name = pouleData.omschrijving
    p.puntentelmethode = pouleData.puntentelmethode
    return p
  }))
}

async function getPoules(clubId: string, teamType: string, teamId: string, fetcher: CountedFetcher): Promise<Poule[]> {
  const response = await fetcher.fetch(`/competitie/pouleindelingen?team=%2Fcompetitie%2Fteams%2F${clubId}%2F${teamType}%2F${teamId}`)
  const hydraData = await response.json() as HydraResponseList<Poule>
  const data = hydraData['hydra:member']
  return data
}

async function addTeamsToPoules(poules: Poule[], fetcher: CountedFetcher) {
  return Promise.all(poules.map(async (p) => {
    const response = await fetcher.fetch(`/competitie/pouleindelingen?poule=${p.poule}`)
    const data: HydraResponseList<Team> = await response.json()
    p.teams = data['hydra:member']
    return p
  }))
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle preflight if you enabled CORS
    if (req.method === "OPTIONS") {
      return withCors(
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Max-Age": "86400",
          },
        }), env.ALLOWED_ORIGIN
      );
    }

    const url = new URL(req.url);
    // -------------------------
    // GET /api/search?q=...
    // -------------------------
    if (req.method === "GET" && url.pathname === "/api/search") {
      const q = url.searchParams.get("q");
      if (!q) {
        const res = json({ error: "Missing query parameter 'q'" }, 400);
        return withCors(res, env.ALLOWED_ORIGIN);
      }

      const requestBody: SearchRequest = {
        q,
        type: "competition",
        exclude: "",
      };

      const upstream = await fetch("https://www.volleybal.nl/api/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!upstream.ok) {
        const res = json(
          { error: "Het is niet gelukt om de zoekresultaten op te halen" },
          upstream.status
        );
        return withCors(res, env.ALLOWED_ORIGIN);
      }

      const data = (await upstream.json()) as NevoboSearchResponse;
      const res = json(data.data, 200);
      return withCors(res, env.ALLOWED_ORIGIN);
    }

    // -------------------------
    // GET /api/team/:clubId/:teamType/:teamId
    // -------------------------
    const teamPattern = new URLPattern({
      pathname: "/api/team/:clubId/:teamType/:teamId",
    });
    const match = teamPattern.exec(req.url);

    if (req.method === "GET" && match) {
      const counted = new CountedFetcher();
      const { clubId, teamType, teamId } = match.pathname.groups as Record<string, string>;
      const before = counted.count;

      try {
        const response = await getTeamInfo(clubId, teamType, teamId, counted);
        const used = counted.count - before;
        console.log(
          `Fetched ${used} times from Nevobo API for team ${clubId} ${teamType} ${teamId}`
        );
        const res = json(response, 200);
        return withCors(res, env.ALLOWED_ORIGIN);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("getTeamInfo failed:", message);
        const res = json({ error: "Er is iets misgegaan bij het ophalen van de data", message }, 500);
        return withCors(res, env.ALLOWED_ORIGIN);
      }
    }

    // 404
    return withCors(json({ error: "Not Found" }, 404), env.ALLOWED_ORIGIN);
  },
};
