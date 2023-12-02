import { useState, useEffect } from "react";
import {
	Box,
	ImageList,
	Pagination,
	Stack,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { ArtWorksApi, Artwork } from "@colourbox/ac-server";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { ServerURI } from "@colourbox/common/utils/IAsyncResult";

const SavedArtworksPage = () => {
	const [savedArtworks, setSavedArtworks] = useState<Artwork[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const smallScreen = useMediaQuery("(max-width:700px)");
	const artworkApi = new ArtWorksApi(
		undefined,
		ServerURI.clientSide
	);

	const fetchSavedArtworks = async (page: number) => {
		try {
			const { data: result } =
				await artworkApi.apiArtWorksPagenumberContentnumberGet(page, 15);
			setSavedArtworks(result);
		} catch (error) {
			console.error("Error fetching saved artworks:", error);
		}
	};

	useEffect(() => {
		const fetchTotalCount = async () => {
			try {
				const { data: totalCount } =
					await artworkApi.apiArtWorksTotalcountGet();
				//@ts-ignore
				setTotalPages(Math.ceil(totalCount / 15));
				await fetchSavedArtworks(currentPage);
			} catch (error) {
				console.error("Error fetching total count:", error);
			}
		};

		fetchTotalCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setCurrentPage(value);
	};

	if (!savedArtworks.length) {
		return (
			<Box
				sx={{
					maxWidth: { xs: "95%", sm: "80%", lg: "70%", xl: "80rem" },
					mx: "auto",
				}}
			>
				<Typography
					variant="h5"
					sx={{ textAlign: "center" }}
					color="text.secondary"
					my={2}
				>
					No artworks available yet
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				maxWidth: { xs: "95%", sm: "80%", lg: "70%", xl: "80rem" },
				mx: "auto",
			}}
		>
			<Stack
				direction="row"
				spacing={1}
				my={2}
				sx={{ color: "text.secondary" }}
			>
				<BookmarksIcon />
				<Typography variant="h5">Saved for later</Typography>
			</Stack>
			<Box sx={{ maxWidth: "90vw", mx: "auto" }}>
				<ImageList variant="masonry" cols={smallScreen ? 1 : 4} gap={8}>
					{savedArtworks.map((artwork, i) => (
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
		</Box>
	);
};

export default SavedArtworksPage;
