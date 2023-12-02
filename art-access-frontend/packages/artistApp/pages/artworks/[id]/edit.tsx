import * as yup from "yup";
import { useEffect, useState } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-hot-toast";
import {
	ArtWorksApi,
	Artwork,
	Configuration,
	//	CreatorProfilesApi,
} from "@colourbox/ac-server";
const MDEditor = dynamic(
	() => import("@uiw/react-md-editor").then((mod) => mod.default),
	{ ssr: false }
);

import UploadImageButton from "@colourbox/common/utils/UploadImageButton";
import { useAuth0 } from "@auth0/auth0-react";
import { IAsyncResult, ServerURI } from "@colourbox/common/utils/IAsyncResult";
import ArtworkSaleInput from "../../../components/artwork/ArtworkSaleInput";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
const validationSchema = yup.object().shape({
	label: yup
		.string()
		.max(50, "Title can't be longer than 50 characters")
		.required("Title is required"),
	imageURL: yup.string().required("Image is required"),
	description: yup
		.string()
		.min(10)
		.required("Description must have at least 10 characters"),
});
const saleValidationSchema = yup.object().shape({
	price: yup.number().required("Price is required"),
	size: yup.object().shape({
		height: yup.number().required("Height is required"),
		width: yup.number().required("Width is required"),
	}),
});
const ArtworkEditPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [fetchedArtwork, setFetchedArtwork] = useState<IAsyncResult<Artwork>>();
	const [artwork, setArtwork] = useState<Artwork>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const { getAccessTokenSilently } = useAuth0();
	const artworkApi = new ArtWorksApi(undefined, ServerURI.clientSide);
	/* const artistApi = new CreatorProfilesApi(
		undefined,
		ServerURI.clientSide
	); */

	useEffect(() => {
		setFetchedArtwork({ isLoading: true });
		(async () => {
			try {
				//@ts-ignore
				const { data: result } = await artworkApi.apiArtWorksArtworkidGet(id!);
				setFetchedArtwork({ result });
				setArtwork(result);
				/* 	setArtwork({
					result: {
						imageURL:
							"https://th.bing.com/th/id/OIG.kR8hBjFH54JiOM.RtUaW?pid=ImgGn",
						label: "Sunset over the mountains",
						description:
							"Lorem ipsum dolor sit amet, **consectetur** adipiscing elit",
						sizes: [
							{
								height: 16,
								width: 8,
							},
							{
								height: 20,
								width: 10,
							},
						],
						price: 205,
					},
				});
				setArtist({
					result: {
						name: "Lorem Ipsum",
					},
				}); */
			} catch (error: any) {
				setFetchedArtwork({ error });
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);
	const onSubmit = async () => {
		try {
			const token = await getAccessTokenSilently();
			const api = new ArtWorksApi(
				new Configuration({
					baseOptions: {
						headers: {
							Authorization: "Bearer " + token,
						},
					},
				}) || undefined,
				ServerURI.clientSide
			);
			const { data: profile } = await api.apiArtWorksPost(artwork);
			toast.success(
				"Profile submitted successfully, redirecting to your profile"
			);
			setTimeout(() => {
				router.push(`/profile/${profile.id}`);
			}, 1000);
		} catch {
			toast.error("Couldn't submit profile");
		}
	};
	const handleChange =
		(fieldName: keyof Artwork) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target;
			let cleanedValue = value;

			if (name === "price") {
				cleanedValue = value.replace(/[^0-9.]/g, "");
			}

			setArtwork((profile) => ({
				...profile,
				[fieldName]: cleanedValue,
			}));
		};
	const handleSubmit = (
		event: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>
	) => {
		event.preventDefault();
		setSubmitted(true);
		validationSchema
			.validate(artwork, { abortEarly: false })
			.then(async () => {
				try {
					artwork?.saleDetails?.map((sale) => {
						saleValidationSchema.validate(sale).catch(() => {
							throw new Error("Invalid size");
						});
					});

					setIsLoading(true);
					setErrors({});
					await onSubmit();
				} catch {
					//
				}
			})
			.catch((error) => {
				const newErrors: Record<string, string> = {};
				error.inner.forEach((err: any) => {
					newErrors[err.path] = err.message;
				});
				setErrors(newErrors);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};
	const handleFileChange =
		(fieldName: keyof Artwork) => (file: File | null) => {
			if (file) {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onloadend = () => {
					setArtwork((a) => ({
						...a,
						[fieldName]: reader.result as string,
					}));
				};
			}
		};

	/* 	const testAPI = async () => {
		console.log("urlaudiens", process.env.NEXT_PUBLIC_AUDIENCE)
		const token = await getAccessTokenSilently();
		const apiArt = new ArtWorksApi(
			new Configuration({
				baseOptions: {
					headers: {
						Authorization: "Bearer " + token,
					},
				},
			}) || undefined,
			ServerURI.clientSide
		);

		console.log("apiArt", apiArt);
		const { data: response } =
			await apiArt.apiArtWorksMyartworksCreatorprofileidGet("haha");
		console.log("res", response);
		alert(response);
	}; 
 */
	if (fetchedArtwork?.isLoading || !id)
		return <LoadingSpinner spinnerSize={48} my={10} />;
	if (fetchedArtwork?.error)
		return (
			<Box sx={{ mx: "auto", my: 10 }}>
				<Alert severity="error">Couldn&apos;t find this artist</Alert>
			</Box>
		);
	return (
		<form onSubmit={handleSubmit}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					maxWidth: { xs: "98vw", md: "60rem" },
				}}
			>
				<Typography variant="h5" my={2} textAlign="left">
					Preview Image
				</Typography>
				<UploadImageButton
					id="image"
					onChange={handleFileChange("imageURL")}
					image={artwork?.imageURL ?? ""}
					error={Boolean(errors.imageURL)}
					helperText={errors.imageURL}
				/>
				<Typography variant="h5" my={2} textAlign="left">
					Artwork Name
				</Typography>
				<TextField
					id="name"
					label="Name"
					value={artwork?.label}
					onChange={handleChange("label")}
					error={Boolean(errors.label)}
					helperText={errors.label}
					sx={{ maxWidth: "30rem" }}
					fullWidth
				/>
				<Typography variant="h5" my={2} textAlign="left">
					Artwork Description
				</Typography>

				<MDEditor
					value={artwork?.description ?? ""}
					onChange={(x) => setArtwork({ ...artwork, description: x })}
				/>
				{errors["description"] && (
					<Typography
						variant="caption"
						sx={{ my: 0.5, mx: 1 }}
						color="secondary"
					>
						{errors["description"]}
					</Typography>
				)}
				<Typography variant="h5" my={2} textAlign="left">
					Artwork Print Sizes
				</Typography>
				{artwork?.saleDetails?.map((_s, i) => (
					<ArtworkSaleInput
						key={i}
						submitted={submitted}
						updateSale={(s) => {
							const saleDetails = artwork?.saleDetails ?? [];
							saleDetails[i] = s;
							setArtwork({ ...artwork, saleDetails });
						}}
						removeSale={() => {
							const saleDetails = artwork?.saleDetails ?? [];
							saleDetails.splice(i, 1);
							setArtwork({ ...artwork, saleDetails });
						}}
					/>
				))}
				<Button
					onClick={() => {
						setArtwork({
							...artwork,
							saleDetails: [...(artwork?.saleDetails ?? []), {}],
						});
					}}
					variant="contained"
					sx={{ mr: "auto", mt: 3, borderRadius: "20px" }}
				>
					Add size
				</Button>
				{submitted && !artwork?.saleDetails?.length && (
					<Typography variant="caption" color="secondary">
						You need to add at least one print size
					</Typography>
				)}
				{/* <Typography variant="h5" my={2} textAlign="left">
					Artwork Price
				</Typography>
				<TextField
					id="price"
					label="Price"
					value={artwork?.price}
					onChange={handleChange("price")}
					error={Boolean(errors.width)}
					helperText={errors.width}
					InputProps={{
						endAdornment: <InputAdornment position="end">€</InputAdornment>,
					}}
					sx={{ maxWidth: "30rem" }}
					placeholder="124"
					onKeyPress={(event) => {
						const allowedChars = "0123456789.";
						const inputChar = event.key;
						const currentInput = (event.target as HTMLInputElement).value;

						// Prevent entering non-allowed characters
						if (!allowedChars.includes(inputChar)) {
							event.preventDefault();
						}

						// Prevent entering more than one decimal point
						if (inputChar === "." && currentInput.includes(".")) {
							event.preventDefault();
						}
					}}
				/> */}
				<LoadingButton
					loading={isLoading}
					type="submit"
					variant="contained"
					sx={{ my: 6, mx: "auto", borderRadius: "24px" }}
				>
					Submit Artwork
				</LoadingButton>
			</Box>
		</form>
	);
};

export default ArtworkEditPage;
