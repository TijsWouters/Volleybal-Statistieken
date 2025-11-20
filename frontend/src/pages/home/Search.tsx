import { TextField } from '@mui/material'
import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'

import SearchResultsList from './SearchResultsList'

export default function TeamSearch({ type }: { type: 'team' | 'club' }) {
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
      }
      else {
        setResults(data.filter((result: SearchResult) => result.type === type))
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    if (searchTerm.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      return
    }
    setLoading(true)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => {
      fetchTeams()
    }, 1500))
  }, [searchTerm])

  let error = null

  if (searchTerm.length === 0) {
    error = `Vul een zoekterm in om naar ${type}s te zoeken`
  }
  else if (searchTerm.length < 3) {
    error = 'Vul minimaal drie karakters in om te zoeken'
  }
  else if (results.length === 0) {
    error = `Geen ${type}s gevonden`
  }

  return (
    <div style={{ paddingTop: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TextField
        label={`${capitalizeFirstLetter(type)} zoeken`}
        variant="filled"
        onChange={e => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            endAdornment: <SearchIcon style={{ marginRight: '8px' }} />,
          },
        }}
        fullWidth
        placeholder={`Vul een ${type}naam in om te zoeken`}
      />

      <SearchResultsList results={results} loading={loading} error={error} />
    </div>
  )
}

export type SearchResult = {
  title: string
  url: string
  type: 'team' | 'club'
}

function capitalizeFirstLetter(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}
