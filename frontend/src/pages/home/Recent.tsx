import SearchResultsList from './SearchResultsList'
import { Typography } from '@mui/material'
import { useRecent } from '@/hooks/useRecent'

export default function Recent() {
  const { recent } = useRecent()

  const error = recent.length === 0 ? 'Je hebt nog geen teams of clubs bekeken' : null

  const recentWithUrls = recent.map(entry => ({
    title: entry.title,
    url: `/${entry.type}/${entry.url}`,
    type: entry.type,
  }))

  return (
    <div className="flex flex-col w-full">
      <Typography className="p-4 text-center font-light">
        Hier zie je de teams en clubs die je onlangs hebt bekeken
      </Typography>
      <SearchResultsList results={recentWithUrls.slice(0).reverse()} error={error} loading={false} placeHolder={<></>} />
    </div>

  )
}
