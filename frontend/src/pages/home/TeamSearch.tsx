import { TextField } from '@mui/material'
import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'

import SearchResultsList from './SearchResultsList'

export default function TeamSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  function fetchTeams() {
    fetch(`${import.meta.env.VITE_API_URL}/search?q=${searchTerm}`, {
      method: 'GET',
    }).then((response) => {
      if (response.ok) return response.json()
      throw new Error('Het is niet gelukt om de zoekresultaten op te halen')
    }).then((data) => {
      if (!data) {
        setResults([])
      } else {
        setResults(data)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults([])
      return
    }
    setLoading(true)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => {
      fetchTeams()
    }, 1000))
  }, [searchTerm])

  return (
    <div className="team-selection">
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
        placeholder='Vul een teamnaam in om te zoeken'
      />
      <div className="search-results">
        <SearchResultsList results={results} loading={loading} searchTerm={searchTerm} />
      </div>
    </div>
  )
}

export type SearchResult = {
  id: string
  title: string
  url: string
  type: 'team' | 'club'
}
