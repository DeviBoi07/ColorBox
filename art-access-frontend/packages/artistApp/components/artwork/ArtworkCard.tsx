/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImageListItem, Typography, Link } from "@mui/material";
import { Artwork } from "@colourBox/art-access-backend/ac-server";
const art = ({ artwork }: { artwork: Artwork }) => {
  fetch(Artwork.imageURL);
};
//import Image from "next/image";
const ArtworkCard = ({ artwork }: { artwork: Artwork }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Link underline="none" href={`artworks/${artwork.id}`}>
      <ImageListItem
        sx={{ m: 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={artwork.imageURL ?? ""}
          alt={artwork.label ?? ""}
          loading="lazy"
        />
        {hovered && (
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
            {artwork.label}
          </Typography>
        )}
      </ImageListItem>
    </Link>
  );
};

export default ArtworkCard;
