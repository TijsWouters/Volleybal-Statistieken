import { TextField, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'

import SearchResultsList from '../SearchResultsList'

export default function TeamSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [teams, setTeams] = useState<TeamSearchResult[]>([])

  function fetchTeams() {
    fetch(`http://localhost:3000/search?q=${searchTerm}`, {
      method: 'GET',
    }).then((response) => {
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    }).then((data) => {
      setTeams(data.data.map((item: { id: string, title: string, url: string }) => ({ id: item.id, name: item.title, url: item.url })))
    }).catch((error) => {
      console.error('There was a problem with the fetch operation:', error)
    })
  }

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => {
      fetchTeams()
    }, 300))
  }, [searchTerm])

  return (
    <div className="team-selection">
      <Typography variant="h4" gutterBottom color="primary">
        Team zoeken
      </Typography>
      <TextField
        label="Team zoeken"
        variant="outlined"
        onChange={e => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchIcon style={{ marginRight: '8px' }} />,
          },
        }}
        fullWidth
      />
      <SearchResultsList teams={teams} />
    </div>
  )
}

export type TeamSearchResult = {
  id: string
  name: string
  url: string
}
