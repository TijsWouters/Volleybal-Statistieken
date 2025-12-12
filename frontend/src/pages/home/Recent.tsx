import SearchResultsList from './SearchResultsList'
import { Typography } from '@mui/material'
import { useRecent } from '@/hooks/useRecent'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'

export default function Recent() {
  const { recent } = useRecent()

  const recentWithUrls = recent.map(entry => ({
    title: entry.title,
    url: `/${entry.type}/${entry.url}`,
    type: entry.type,
  }))

  return (
    <div className="flex flex-col w-full grow">
      <Typography className="p-4 text-center font-light">
        Deze teams en clubs heb je recent bekeken
      </Typography>
      <SearchResultsList results={recentWithUrls.length > 0 ? recentWithUrls.slice(0).reverse() : null} error={null} loading={false} placeHolder={<PlaceHolder />} />
    </div>

  )
}

function PlaceHolder() {
  return (
    <div className="flex flex-col grow w-full justify-center items-center text-black opacity-80 dark:text-white">
      <div className="relative">
        <RestoreRoundedIcon className="text-[55vmin]" />
      </div>
      <Typography textAlign="center" variant="h6" className="px-4 text-center">
        Je hebt nog geen teams of clubs bekeken
      </Typography>
    </div>
  )
}
