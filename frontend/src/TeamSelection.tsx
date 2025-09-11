import { TextField } from "@mui/material"
import { useState, useEffect } from "react"
import SearchIcon from '@mui/icons-material/Search';

export default function TeamSelection() {

	const [searchTerm, setSearchTerm] = useState("")
	const [teams, setTeams] = useState<TeamSearchResult[]>([])

	useEffect(() => {
		fetch(`http://localhost:3000/search?q=${searchTerm}`, {
			method: 'GET',
		}).then(response => {
			if (response.ok) return response.json()
			throw new Error('Network response was not ok.')
		}).then(data => {
			console.log(data)
			//setTeams(data.data.map((item: { id: string, name: string }) => ({ id: item.id, name: item.name })))
		}).catch(error => {
			console.error('There was a problem with the fetch operation:', error)
		})
	}, [searchTerm])

	return (
		<div>
			<TextField
				label="Team zoeken"
				variant="outlined"
				onChange={(e) => setSearchTerm(e.target.value)}
				slotProps={{
					input: {
						startAdornment: <SearchIcon style={{ marginRight: '8px' }} />,
					},
				}}
			/>
			{teams.map(team => (
				<div key={team.id}>{team.name}</div>
			))}
		</div>
	)
}

type TeamSearchResult = {
	id: string
	name: string
}