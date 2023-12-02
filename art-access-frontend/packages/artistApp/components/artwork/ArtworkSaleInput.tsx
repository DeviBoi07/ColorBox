import {
	Box,
	Button,
	Divider,
	InputAdornment,
	Stack,
	TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Clear } from "@mui/icons-material";
import { PrintSaleDetail, ArtWorkSaleSize } from "@colourbox/ac-server";
import * as yup from "yup";

const validationSchema = yup.object().shape({
	price: yup.number().required("Price is required"),
	Sale: yup.object().shape({
		height: yup.number().required("Height is required"),
		width: yup.number().required("Width is required"),
	}),
});

const ArtworkSaleInput = ({
	updateSale,
	submitted,
	removeSale,
}: {
	updateSale: (sale: PrintSaleDetail) => any;
	submitted?: boolean;
	removeSale: () => any;
}) => {
	const [sale, setSale] = useState<PrintSaleDetail>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	useEffect(() => {
		if (submitted) {
			validationSchema.validate(sale, { abortEarly: false }).catch((error) => {
				const newErrors: Record<string, string> = {};
				error.inner.forEach((err: any) => {
					if (err.path === "size.height") {
						newErrors.height = err.message;
					} else if (err.path === "size.width") {
						newErrors.width = err.message;
					} else {
						newErrors[err.path] = err.message;
					}
				});
				setErrors(newErrors);
			});
		}
	}, [submitted, sale]);

	const handleChange =
		(fieldName: keyof PrintSaleDetail) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			let cleanedValue = value;

			cleanedValue = value.replace(/[^0-9.]/g, "");
			const newSale: PrintSaleDetail = {
				...sale,
				[fieldName]: cleanedValue,
			};
			setSale(newSale);
			updateSale(newSale);
		};
	const handleSizeChange =
		(fieldName: keyof ArtWorkSaleSize) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			let cleanedValue = value;

			cleanedValue = value.replace(/[^0-9.]/g, "");
			const newSale: PrintSaleDetail = {
				...sale,
				size: {
					...sale?.size,
					[fieldName]: cleanedValue,
				},
			};
			setSale(newSale);
			updateSale(newSale);
		};
	return (
		<Box my={1} maxWidth="30rem">
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={{ xs: 1, sm: 2, md: 4 }}
			>
				<Box>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={{ xs: 1, sm: 2, md: 4 }}
					>
						<TextField
							id="height"
							label="Height"
							size="small"
							value={sale?.size?.height}
							onChange={handleSizeChange("height")}
							error={Boolean(errors.height)}
							helperText={errors.height}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">H</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">cm</InputAdornment>
								),
							}}
							placeholder="12.6"
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
							fullWidth
						/>
						<TextField
							id="width"
							label="Width"
							size="small"
							value={sale?.size?.width}
							onChange={handleSizeChange("width")}
							error={Boolean(errors.width)}
							helperText={errors.width}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">W</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">cm</InputAdornment>
								),
							}}
							placeholder="6.3"
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
							fullWidth
						/>
					</Stack>
					<TextField
						id="price"
						label="Price"
						size="small"
						value={sale?.price}
						onChange={handleChange("price")}
						error={Boolean(errors.width)}
						helperText={errors.width}
						InputProps={{
							endAdornment: <InputAdornment position="end">€</InputAdornment>,
						}}
						sx={{ maxWidth: "30rem", my: 1 }}
						placeholder="124"
						fullWidth
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
					/>
				</Box>
				<Box
					sx={{
						mt: "auto",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Button
						onClick={() => removeSale()}
						variant="contained"
						color="error"
						sx={{ height: "50%" }}
					>
						<Clear />
					</Button>
				</Box>
			</Stack>
			<Divider sx={{ mt: 1 }} />
		</Box>
	);
};

export default ArtworkSaleInput;
