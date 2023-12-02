import { CreatorProfile, CreatorProfilesApi } from "@colourbox/ac-server";
import { IAsyncResult, ServerURI } from "@colourbox/common/utils/IAsyncResult";
import {
	Alert,
	Box,
	ImageList,
	Pagination,
	Typography,
	useMediaQuery,
} from "@mui/material";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
import { useState } from "react";
import ArtistCard from "../../components/artists/ArtistCard";
import { GetServerSideProps } from "next";

interface ArtistsPageProps {
	initialArtists: IAsyncResult<CreatorProfile[]>;
	totalPages: number;
}

const ArtistsPage = ({ initialArtists, totalPages }: ArtistsPageProps) => {
	const [artists, setArtists] =
		useState<IAsyncResult<CreatorProfile[]>>(initialArtists);
	const artistApi = new CreatorProfilesApi(undefined, ServerURI.clientSide);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const smallScreen = useMediaQuery("(max-width:700px)");

	const updatePage = async (page: number) => {
		try {
			setArtists({ isLoading: true });
			const { data: result } =
				await artistApi.apiCreatorProfilesPagenumberContentnumberGet(page, 15);
			setArtists({ result });
		} catch (e: any) {
			setArtists({ error: e });
		}
	};

	const handlePageChange = (
		event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setCurrentPage(value);
		updatePage(value);
	};

	if (artists?.isLoading) return <LoadingSpinner my={10} progressSize={48} />;

	if (artists?.error)
		return (
			<Box sx={{ mx: "auto", my: 10 }}>
				<Alert severity="error">Couldn&apos;t load artists</Alert>
			</Box>
		);

	return (
		<Box
			sx={{
				maxWidth: { xs: "95%", sm: "80%", lg: "70%", xl: "80rem" },
				mx: "auto",
			}}
		>
			{artists?.result && artists.result.length > 0 ? (
				<>
					<Typography variant="h5" color="text.secondary" my={2}>
						Artists
					</Typography>
					<Box sx={{ maxWidth: "90vw", mx: "auto" }}>
						<ImageList variant="masonry" cols={smallScreen ? 2 : 4} gap={8}>
							{artists.result.map((artist, i) => (
								<ArtistCard artist={artist} key={i} />
							))}
						</ImageList>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Pagination
							count={totalPages}
							page={currentPage}
							onChange={handlePageChange}
						/>
					</Box>
				</>
			) : (
				<Typography
					variant="h5"
					sx={{ textAlign: "center" }}
					color="text.secondary"
					my={2}
				>
					No artists out there yet..
				</Typography>
			)}
		</Box>
	);
};

export const getServerSideProps: GetServerSideProps<
	ArtistsPageProps
> = async () => {
	const artistApi = new CreatorProfilesApi(undefined, ServerURI.serverSide);

	try {
		const { data: totalCount } =
			await artistApi.apiCreatorProfilesTotalcountGet();
		//@ts-ignore
		const totalPages = Math.ceil(totalCount / 15);
		const { data: result } =
			await artistApi.apiCreatorProfilesPagenumberContentnumberGet(1, 15);

		return {
			props: {
				initialArtists: { result },
				totalPages,
			},
		};
	} catch (error) {
		console.error(
			`ERROR: artists/index:getServerSideProps failed to load artwork :${error}`
		);
		return {
			props: {
				initialArtists: { result: [] },
				totalPages: 1,
			},
		};
	}
};

export default ArtistsPage;
