import Search from './Search'

import SearchIcon from '@mui/icons-material/Search'
import GroupsIcon from '@mui/icons-material/Groups'
import { Typography } from '@mui/material'

export default function TeamSearch() {
  return <Search type="team" placeHolder={<PlaceHolder />} />
}

function PlaceHolder() {
  return (
    <div className="flex flex-col grow w-full justify-center items-center text-black opacity-80 dark:text-white">
      <div className="relative">
        <GroupsIcon className="absolute left-[16vmin] top-[16vmin] text-[16vmin]" />
        <SearchIcon className="text-[60vmin]" />
      </div>
      <Typography textAlign="center" variant="h6" className="px-4 text-center">
        Vul minimaal drie karakters in om naar teams te zoeken
      </Typography>
    </div>
  )
}
