import type { TeamSearchResult } from "./home/TeamSearch"
import { List, ListItemButton, ListItemText, ListItem } from "@mui/material"


export default function SearchResultsList({ teams }: { teams: TeamSearchResult[] }) {
    return (
        <List className="search-results-list">
            {teams.map(team => (
                <ListItem divider dense key={team.id} disablePadding>
                    <ListItemButton key={team.id} component="a" href={mapNevoboUrl(team.url)}>
                        <ListItemText primary={team.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    )
}

function mapNevoboUrl(nevoboUrl: string) {
    const parts = nevoboUrl.split('/').filter(Boolean);
    const lastThree = parts.slice(-3).join('/');
    return `/team/${lastThree}`;
}