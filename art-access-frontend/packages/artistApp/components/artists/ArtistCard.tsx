import { useState } from "react";
import { ImageListItem, Link, Typography } from "@mui/material";
import { CreatorProfile } from "@colourbox/ac-server";
import Image from "next/image";
const ArtworkCard = ({ artist }: { artist: CreatorProfile }) => {
	const [hovered, setHovered] = useState(false);

	const handleMouseEnter = () => {
		setHovered(true);
	};

	const handleMouseLeave = () => {
		setHovered(false);
	};

	return (
		<Link href={`/profile/${artist?.id ?? ""}`}>
			<ImageListItem
				sx={{ m: 1 }}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{artist.imageURL ? (
					<Image
						fill
						src={artist.imageURL}
						alt={artist.name ?? ""}
						loading="lazy"
					/>
				) : (
					<Typography>{artist.name}</Typography>
				)}
				{artist.imageURL && hovered && (
					<Typography
						variant="body2"
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: "rgba(0, 0, 0, 0.25)",
							color: "white",
							padding: "8px",
						}}
					>
						{artist.name}
					</Typography>
				)}
			</ImageListItem>
		</Link>
	);
};

export default ArtworkCard;
