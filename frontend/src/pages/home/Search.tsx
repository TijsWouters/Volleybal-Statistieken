import { TextField } from '@mui/material'
import { useState, useEffect, type JSX } from 'react'
import SearchIcon from '@mui/icons-material/Search'

import SearchResultsList from './SearchResultsList'

export default function TeamSearch({ type, placeHolder }: { type: 'team' | 'club', placeHolder: JSX.Element }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [results, setResults] = useState<SearchResult[] | null>(null)
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
      setResults(null)
      return
    }
    setLoading(true)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => {
      fetchTeams()
    }, 1500))
  }, [searchTerm])

  let error = null

  if (results && results.length === 0) {
    error = `Geen ${type}s gevonden`
  }

  return (
    <>
      <TextField
        className="m-2 mt-4 dark:border-white"
        label={`${capitalizeFirstLetter(type)} zoeken`}
        variant="outlined"
        onChange={e => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            endAdornment: <SearchIcon className="mr-2" />,
          },
        }}
        placeholder={`Vul een ${type}naam in om te zoeken`}
      />

      <SearchResultsList results={results} loading={loading} error={error} placeHolder={placeHolder} />
    </>
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
