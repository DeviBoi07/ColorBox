import { ArtWorksApi, Artwork } from "@colourbox/ac-server";
import {
	ErrorString,
	IAsyncResult,
	ServerURI,
} from "@colourbox/common/utils/IAsyncResult";
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
import ArtworkCard from "@/components/artwork/ArtworkCard";
import { GetServerSideProps } from "next";

const Artworks = ({
	initialArtworks,
	totalPages,
}: {
	initialArtworks: IAsyncResult<Artwork[]>;
	totalPages: number;
}) => {
	const [artworks, setArtworks] =
		useState<IAsyncResult<Artwork[]>>(initialArtworks);
	const artworkApi = new ArtWorksApi(undefined, ServerURI.clientSide);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const smallScreen = useMediaQuery("(max-width:700px)");
	const updatePage = async (page: number) => {
		try {
			setArtworks({ isLoading: true });
			const { data: result } =
				await artworkApi.apiArtWorksPagenumberContentnumberGet(page, 15);
			setArtworks({ result });
		} catch (e: any) {
			setArtworks({ error: e });
		}
	};

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setCurrentPage(value);
		updatePage(value);
	};
	if (artworks?.isLoading) return <LoadingSpinner progressSize={48} my={10} />;
	if (artworks?.error)
		return (
			<Box sx={{ mx: "auto", my: 10 }}>
				<Alert severity="error">Couldn&apos;t load artworks</Alert>
			</Box>
		);
	return (
		<Box
			sx={{
				maxWidth: { xs: "95%", sm: "80%", lg: "70%", xl: "80rem" },
				mx: "auto",
			}}
		>
			{artworks?.result && artworks.result.length > 0 ? (
				<>
					<Typography variant="h5" color="text.secondary" my={2}>
						Gallery
					</Typography>
					<Box sx={{ maxWidth: "90vw", mx: "auto" }}>
						<ImageList variant="masonry" cols={smallScreen ? 1 : 4} gap={8}>
							{artworks.result.map((artwork, i) => (
								<ArtworkCard artwork={artwork} key={i} />
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
					No artworks available yet
				</Typography>
			)}
		</Box>
	);
};

export const getServerSideProps: GetServerSideProps = async () => {
	const artworkApi = new ArtWorksApi(undefined, ServerURI.serverSide);

	try {
		const { data: totalCount } = await artworkApi.apiArtWorksTotalcountGet();
		//@ts-ignore
		const totalPages = Math.ceil(totalCount / 15);
		const { data: result } =
			await artworkApi.apiArtWorksPagenumberContentnumberGet(1, 15);

		return {
			props: {
				initialArtworks: { result },
				totalPages: totalPages,
			},
		};
	} catch (error) {
		console.error(
			"artworks/index:getServerSideProps failed to load artwork",
			error
		);

		return {
			props: {
				initialArtworks: { error: ErrorString(error as Error) },
				totalPages: 1,
			},
		};
	}
};

export default Artworks;
