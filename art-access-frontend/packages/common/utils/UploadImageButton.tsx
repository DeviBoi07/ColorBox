import { Box, Button, Typography } from "@mui/material";
import { useState, ChangeEvent } from "react";
import UploadIcon from "@mui/icons-material/Upload";
interface Props {
	id: string;
	onChange: (file: File) => void;
	error?: boolean;
	image?: string;
	helperText?: string;
}
const UploadImageButton = ({
	id,
	onChange,
	image,
	error,
	helperText,
}: Props) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(image ?? null);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files && event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
			onChange(file);
		} else {
			setPreviewUrl(null);
		}
	};

	return (
		<>
			{previewUrl && (
				<img
					style={{ maxWidth: "300px", margin: "0 auto", borderRadius: "10px" }}
					src={previewUrl}
					alt="Preview"
				/>
			)}
			<Box mx={previewUrl ? "auto" : 0} my={2}>
				<input
					accept="image/*"
					style={{ display: "none" }}
					id={id}
					type="file"
					onChange={handleFileChange}
				/>
				<label htmlFor={id}>
					<Button
						variant="contained"
						color="primary"
						component="span"
						sx={{ borderRadius: "24px" }}
						startIcon={<UploadIcon />}
					>
						{previewUrl ? "Change Image" : " Upload Image"}
					</Button>
				</label>
			</Box>
			{error && (
				<Typography variant="caption" ml={2} color="error">
					{helperText}
				</Typography>
			)}
		</>
	);
};

export default UploadImageButton;
