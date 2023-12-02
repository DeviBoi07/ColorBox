import * as yup from "yup";
import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import UploadImageButton from "@colourbox/common/utils/UploadImageButton";
import { toast } from "react-hot-toast";
import {
	CreatorProfilesApi,
	CreatorProfile,
	Configuration,
} from "@colourbox/ac-server";
const MDEditor = dynamic(
	() => import("@uiw/react-md-editor").then((mod) => mod.default),
	{ ssr: false }
);

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ServerURI } from "@colourbox/common/utils/IAsyncResult";

const validationSchema = yup.object().shape({
	name: yup
		.string()
		.max(50, "Title can't be longer than 50 characters")
		.required("Title is required"),
	imageURL: yup.string().required("Image is required"),
	description: yup
		.string()
		.min(10)
		.required("Description must have at least 10 characters"),
});

const UserProfilePage = () => {
	const [userProfile, setUserProfile] = useState<CreatorProfile>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const { getAccessTokenSilently, isAuthenticated } = useAuth0();
	const router = useRouter();
	const onSubmit = async () => {
		try {
			const token = await getAccessTokenSilently();
			const api = new CreatorProfilesApi(
				new Configuration({
					baseOptions: {
						headers: {
							Authorization: "Bearer " + token,
						},
					},
				}),
				ServerURI.clientSide
			);

			const { data: profile } = await api.apiCreatorProfilesPost(userProfile);
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
		(fieldName: keyof CreatorProfile) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target;
			let cleanedValue = value;

			if (name === "price") {
				cleanedValue = value.replace(/[^0-9.]/g, "");
			}

			setUserProfile((profile) => ({
				...profile,
				[fieldName]: cleanedValue,
			}));
		};
	const handleFileChange =
		(fieldName: keyof CreatorProfile) => (file: File | null) => {
			if (file) {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onloadend = () => {
					setUserProfile((profile) => ({
						...profile,
						[fieldName]: reader.result as string,
					}));
				};
			}
		};

	const handleSubmit = (
		event: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>
	) => {
		event.preventDefault();
		validationSchema
			.validate(userProfile, { abortEarly: false })
			.then(async () => {
				setIsLoading(true);
				setErrors({});
				await onSubmit();
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
	if (!isAuthenticated)
		return (
			<Typography variant="h2" textAlign="center">
				Log in to access page
			</Typography>
		);
	return (
		<form onSubmit={handleSubmit}>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				<Typography variant="h5" my={2} textAlign="left">
					User Image
				</Typography>
				<UploadImageButton
					id="image"
					onChange={handleFileChange("imageURL")}
					image={userProfile?.imageURL ?? ""}
					error={Boolean(errors.imageURL)}
					helperText={errors.imageURL}
				/>
				<Typography variant="h5" my={2} textAlign="left">
					Your name
				</Typography>
				<TextField
					id="name"
					label="Name"
					value={userProfile?.name}
					onChange={handleChange("name")}
					error={Boolean(errors.name)}
					helperText={errors.name}
					fullWidth
				/>
				<Typography variant="h5" my={2} textAlign="left">
					User Description
				</Typography>
				<MDEditor
					value={userProfile?.description ?? ""}
					onChange={(x) => setUserProfile({ ...userProfile, description: x })}
				/>

				<LoadingButton
					loading={isLoading}
					type="submit"
					variant="contained"
					sx={{ my: 4, mx: "auto", borderRadius: "24px" }}
				>
					Submit Profile
				</LoadingButton>
			</Box>
		</form>
	);
};

export default UserProfilePage;
