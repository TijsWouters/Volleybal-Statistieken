import LinkWithIcon from './LinkWithIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackLink({ to, text }: { to: string, text: string }) {
	return (
		<LinkWithIcon to={to} icon={<ArrowBackIcon />} text={text} />
	)
}