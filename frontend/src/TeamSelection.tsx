import { TextField, Paper, } from "@mui/material"
import { useState, useEffect } from "react"
import SearchIcon from '@mui/icons-material/Search';
import SearchResultsList from "./SearchResultsList"

export default function TeamSelection() {

	const [searchTerm, setSearchTerm] = useState("")
	const [lastTypeTime, setLastTypeTime] = useState(0)
	const [teams, setTeams] = useState<TeamSearchResult[]>([])

	useEffect(() => {
		const now = Date.now()
		if (now - lastTypeTime < 300) {
			setLastTypeTime(now)
			return
		}
		setLastTypeTime(now)

		fetch(`http://localhost:3000/search?q=${searchTerm}`, {
			method: 'GET',
		}).then(response => {
			if (response.ok) return response.json()
			throw new Error('Network response was not ok.')
		}).then(data => {
			setTeams(data.data.map((item: { id: string, title: string, url: string }) => ({ id: item.id, name: item.title, url: item.url })))
		}).catch(error => {
			console.error('There was a problem with the fetch operation:', error)
		})
	}, [searchTerm])

	return (
		<div className="team-selection-container">
			<Paper>
				<div className="team-selection">
					<TextField
						label="Team zoeken"
						variant="outlined"
						onChange={(e) => setSearchTerm(e.target.value)}
						slotProps={{
							input: {
								startAdornment: <SearchIcon style={{ marginRight: '8px' }} />,
							},
						}}
						fullWidth
					/>
					<SearchResultsList teams={teams} />
				</div>
			</Paper>
		</div>
	)
}

export type TeamSearchResult = {
	id: string
	name: string,
	url: string,
}