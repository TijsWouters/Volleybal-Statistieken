import { Button } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFavourites } from '@/hooks/useFavourites';

export default function FavouriteButton({ title, url, type }: { title: string, url: string, type: 'team' | 'club' }) {
	const { isFavourite, removeFavourite, addToFavourites} = useFavourites();

	return (
		<Button
			className="favourite-button"
			variant="outlined"
			onClick={() => {
				if (isFavourite(url)) {
					removeFavourite(url)
				} else {
					addToFavourites(title, url, type)
				}
			}}
		>
			{isFavourite(url) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
			<p>{`${isFavourite(url) ? 'Verwijderen uit' : 'Toevoegen aan'} favorieten`}</p>
		</Button>
	)
}