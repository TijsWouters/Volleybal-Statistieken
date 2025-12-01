import Search from './Search'
import SearchIcon from '@mui/icons-material/Search'
import SportsVolleyball from '@mui/icons-material/SportsVolleyball'
import { Typography } from '@mui/material'

export default function ClubSearch() {
  return <Search type="club" placeHolder={<PlaceHolder />} />
}

function PlaceHolder() {
  return (
    <div className="grow w-full flex flex-col justify-center items-center text-black opacity-90 dark:text-white">
      <div className="relative">
        <SportsVolleyball className="absolute left-[16vmin] top-[16vmin] text-[16vmin]" />
        <SearchIcon className="text-[60vmin]" />
      </div>
      <Typography textAlign="center" variant="h6" className="px-4 text-center">
        Vul minimaal drie karakters in om naar clubs te zoeken
      </Typography>
    </div>
  )
}
