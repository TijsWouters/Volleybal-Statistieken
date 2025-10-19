import { Typography } from "@mui/material";
import BackLink from "@/components/BackLink";
import Stack from "@mui/material/Stack";
import LocationPinIcon from '@mui/icons-material/LocationPin'
import GroupsIcon from '@mui/icons-material/Groups';
import CakeIcon from '@mui/icons-material/Cake';
import dayjs from "dayjs";
import LanguageIcon from '@mui/icons-material/Language'
import { Link as RouterLink } from "react-router";
import { Link } from "@mui/material";
import FavouriteButton from "@/components/FavouriteButton";

export default function ClubInfo({ club }: { club: ClubWithTeams }) {
	return (
		<div className="club-info">
			<BackLink to="/" text="Terug naar zoeken" />
			<Typography variant="h3">{club.naam}</Typography>
			<FavouriteButton
				title={club.naam}
				url={`/${club.organisatiecode}`}
				type="club"
			/>
			<img className="club-logo" src={`https://assets.nevobo.nl/organisatie/logo/${club.organisatiecode}.jpg`} alt={`${club.organisatiecode} logo`} />
			<hr />
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<LocationPinIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					{club.vestigingsplaats}
					,
					{' '}
					{club.provincie}
				</Stack>
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<CakeIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					Opgericht op {dayjs(club.oprichting).format('D MMMM YYYY')}
				</Stack>
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<LanguageIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					<Link component={RouterLink} to={club.website} target="_blank" rel="noopener noreferrer">{club.website.split('://')[1]}</Link>
				</Stack>
			</Typography>
			<Typography variant="h6" gutterBottom>
				<Stack direction="row" alignItems="center" gap={1}>
					<GroupsIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
					{club.teams.length} Teams
				</Stack>
			</Typography>
			<hr />
			<iframe
				className="club-map"
				loading="lazy" allowFullScreen
				src={`https://maps.google.com/maps?q=${club.breedtegraad},${club.lengtegraad}&z=9&hl=nl&output=embed`}>
			</iframe>
		</div>
	);
}