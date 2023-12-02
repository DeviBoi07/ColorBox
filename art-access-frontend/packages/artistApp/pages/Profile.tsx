import { useEffect, useState } from "react";
import {
	Alert,
	Avatar,
	Box,
	ImageList,
	Typography,
	useMediaQuery,
} from "@mui/material";
import ArtworkCard from "../components/artwork/ArtworkCard";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
import { IAsyncResult, ServerURI } from "@colourbox/common/utils/IAsyncResult";
import { CreatorProfile, ArtWorksApi, Artwork } from "@colourbox/ac-server";
const MDEditor = dynamic(
	() => import("@uiw/react-md-editor").then((mod) => mod.default),
	{ ssr: false }
);
const MarkdownPreview = dynamic(
	() => import("@uiw/react-markdown-preview").then((mod) => mod.default),
	{ ssr: false }
);
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const ProfilePage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [creatorProfile, setCreatorProfile] =
		useState<IAsyncResult<CreatorProfile>>();
	const [creatorArtworks, setCreatorArtworks] =
		useState<IAsyncResult<Artwork[]>>();
	const smallScreen = useMediaQuery("(max-width:700px)");
	const artworkApi = new ArtWorksApi(undefined, ServerURI.clientSide);
	useEffect(() => {
		setCreatorArtworks({ isLoading: true });
		setCreatorProfile({ isLoading: true });
		(async () => {
			try {
				const { data: userProfile } =
					//@ts-ignore
					await artworkApi.apiArtWorksMyartworksCreatorprofileidGet(id ?? "");
				setCreatorProfile({ result: userProfile.creatorProfile });
				setCreatorArtworks({ result: userProfile.artworks ?? [] });
			} catch (error: any) {
				setCreatorArtworks({ error });
				setCreatorProfile({ error });
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (creatorProfile?.isLoading)
		return <LoadingSpinner progressSize={48} my={10} />;

	if (creatorProfile?.error)
		return (
			<Box sx={{ mx: "auto", my: 10 }}>
				<Alert severity="error">Couldn&apos;t find this artist</Alert>
			</Box>
		);
	return (
		<div>
			<Avatar
				alt={creatorProfile?.result?.name ?? ""}
				src={creatorProfile?.result?.imageURL ?? ""}
				sx={{ height: 80, width: 80 }}
			/>
			<Typography variant="h3" my={3}>
				{creatorProfile?.result?.name}
			</Typography>
			<Box mb={12} mt={6}>
				<Typography variant="h6" sx={{ fontWeight: "bold" }}>
					Description
				</Typography>
				<MarkdownPreview source={creatorProfile?.result?.description ?? ""} />
			</Box>
			{creatorArtworks?.isLoading && <LoadingSpinner my={4} mx="auto" />}
			{creatorArtworks?.result && (
				<Box sx={{ maxWidth: "90vw", mx: "auto" }}>
					<ImageList variant="masonry" cols={smallScreen ? 2 : 4} gap={8}>
						{creatorArtworks?.result.map((artwork, i) => (
							<ArtworkCard artwork={artwork} key={i} />
						))}
					</ImageList>
				</Box>
			)}
		</div>
	);
};

export default ProfilePage;
