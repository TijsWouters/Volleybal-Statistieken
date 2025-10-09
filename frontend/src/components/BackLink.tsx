import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import LinkWithIcon from './LinkWithIcon'

export default function BackLink({ to, text }: { to: string, text: string }) {
  return (
    <LinkWithIcon to={to} icon={<ArrowBackIcon />} text={text} />
  )
}
