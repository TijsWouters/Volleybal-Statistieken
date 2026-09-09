import TEAM_TYPES from '@/assets/teamTypes.json'

import MaleIcon from '@mui/icons-material/Man'
import FemaleIcon from '@mui/icons-material/Woman'
import MixedIcon from '@mui/icons-material/Wc'
import ElderlyMaleIcon from '@mui/icons-material/Elderly'
import ElderlyFemaleIcon from '@mui/icons-material/ElderlyWoman'
import BoyIcon from '@mui/icons-material/Boy'
import GirlIcon from '@mui/icons-material/Girl'
import ChildIcon from '@mui/icons-material/ChildCare'
import SitIcon from '@mui/icons-material/SelfImprovement'
import StarIcon from '@mui/icons-material/Star'

const ICON_MAP = {
  female: FemaleIcon,
  male: MaleIcon,
  mixed: MixedIcon,
  recmale: ElderlyMaleIcon,
  recfemale: ElderlyFemaleIcon,
  boy: BoyIcon,
  girl: GirlIcon,
  child: ChildIcon,
  sit: SitIcon,
  star: StarIcon,
}

type IconKey = keyof typeof ICON_MAP

export function getTeamTypeIcon(teamName: string) {
  const parts = teamName.split(' ')
  const teamType = TEAM_TYPES.find(type => parts.includes(type.afkorting))
  return ICON_MAP[(teamType?.icon || 'mixed') as IconKey]
}

export function getIconForTeamType(teamType: string) {
  const iconKey = TEAM_TYPES.find(type => type.omschrijving === teamType)?.icon || 'mixed'
  return ICON_MAP[iconKey as IconKey]
}
