/* eslint-disable @next/next/no-img-element */
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import useStepper from "@/hooks/stepper";
import { Artwork, CrmApi } from "@colourbox/ac-server";
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Card,
	CardContent,
	Divider,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import constate from "constate";
import { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export const [StepperProvider, useStepperContext] = constate(useStepper);

export const CheckoutPage = () => {
	const [savedArtworks, setSavedArtworks] = useState<Artwork[]>([]);
	const { activePage, nextPage, prevPage } = useStepperContext();
	useEffect(() => {
		(async () => {
			setTimeout(() => {
				setSavedArtworks([
					{
						id: "1",
						imageURL: "https://i.imgur.com/xHrSt88.jpeg",
						label: "Greenary view",
						description:
							"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
						saleDetails: [
							{
								price: 56.87,
								size: {
									height: 5,
									width: 11,
								},
							},
						],
					},
					/* {
						id: "2",
						imageURL: "https://i.imgur.com/48cp1s7.jpg",
						label: "Mountains",
						description:
							"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
						saleDetails: [
							{
								price: 25.88,
								size: {
									height: 4,
									width: 2,
								},
							},
						],
					}, */
				]);
			});
		})();
	}, []);

	const totalPrice = savedArtworks.reduce((accumulator, artwork) => {
		const price = artwork.saleDetails?.[0].price ?? 0;
		return accumulator + price;
	}, 0);

	return (
		<Box>
			<Typography
				mb={3}
				variant="h3"
				color="text.secondary"
				sx={{ fontWeight: 800 }}
			>
				Checkout
			</Typography>
			<CheckoutStepper />
			<Grid
				container
				spacing={4}
				justifyContent="space-between"
				direction={{ xs: "column-reverse", md: "row" }}
			>
				<Grid item xs={12} sm={6}>
					{activePage <= 0 && (
						<form>
							<Stack spacing={2} mb={2}>
								<Typography variant="h5" fontWeight="bold">
									Shipping Details
								</Typography>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="Full Name"
								/>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="Email"
								/>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="Phone Number"
								/>
							</Stack>
							<Stack spacing={2} mb={2}>
								<Typography variant="h5" fontWeight="bold">
									Shipping Address
								</Typography>
								<TextField
									multiline
									rows={4}
									variant="outlined"
									margin="normal"
									fullWidth
									label="Address"
								/>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="City"
								/>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="State"
								/>
								<TextField
									variant="outlined"
									margin="normal"
									fullWidth
									label="Zip Code"
								/>
							</Stack>
							<Box textAlign="center">
								<Button
									onClick={nextPage}
									variant="contained"
									sx={{ borderRadius: "12px" }}
									size="large"
								>
									Continue
								</Button>
							</Box>
						</form>
					)}
					{activePage === 1 && (
						<form>
							<Stack spacing={2} mb={2}>
								<Typography variant="h5" fontWeight="bold">
									Payment method
								</Typography>
								<RadioGroup>
									<Card variant="outlined" sx={{ my: 2 }}>
										<CardContent>
											<FormControlLabel
												value="us-bank-account"
												control={<Radio />}
												label={
													<CardContent>
														<Typography variant="h6">Bank transfer</Typography>
														<Typography variant="body2" color="textSecondary">
															US bank account only
														</Typography>
													</CardContent>
												}
											/>
										</CardContent>
									</Card>

									<Card variant="outlined" sx={{ my: 2 }}>
										<CardContent>
											<FormControlLabel
												value="credit-card"
												control={<Radio />}
												label={
													<CardContent>
														<Typography variant="h6">Credit card</Typography>
													</CardContent>
												}
											/>
										</CardContent>
									</Card>
								</RadioGroup>
							</Stack>
							<Box textAlign="center">
								<Button
									onClick={nextPage}
									variant="contained"
									sx={{ borderRadius: "12px" }}
									size="large"
								>
									Continue
								</Button>
							</Box>
						</form>
					)}
					{activePage === 2 && (
						<>
							<Card sx={{ my: 2 }} variant="outlined">
								<CardContent>
									<Typography variant="h5" fontWeight="extrabold">
										Review
									</Typography>

									<Grid container spacing={2} mt={2}>
										<Grid item xs={12} md={6}>
											<Typography fontWeight="bold">Pricing:</Typography>
											<Typography>
												{savedArtworks[0].saleDetails?.[0].price} €
											</Typography>
										</Grid>

										<Grid item xs={12} md={6}>
											<Typography fontWeight="bold">Payment Method:</Typography>
											<Typography>Visa ending in 1234</Typography>
										</Grid>

										<Grid item xs={12}>
											<Typography fontWeight="bold">
												Billing Address:
											</Typography>
											<Typography>
												John Doe, 123 Main St, New York, NY
											</Typography>
										</Grid>

										<Grid item xs={12}>
											<Box display="flex" alignItems="center">
												<LocationOnIcon sx={{ marginRight: "8px" }} />
												<Typography fontWeight="bold">
													Delivery Address:
												</Typography>
											</Box>
											<Typography>
												Jane Smith, 456 Oak Ave, Los Angeles, CA
											</Typography>
										</Grid>

										<Grid item xs={12}>
											<Typography fontWeight="bold">Delivery Date:</Typography>
											<Typography>July 1, 2023</Typography>
										</Grid>

										<Grid item xs={12}>
											<Typography fontWeight="bold">
												Estimated Delivery Time:
											</Typography>
											<Typography>2-3 business days</Typography>
										</Grid>

										<Grid item xs={12}>
											<Typography fontWeight="bold">Order Total:</Typography>
											<Typography variant="h5" fontWeight="bold">
												65.43 €
											</Typography>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
							<Box textAlign="center">
								<Button
									variant="contained"
									sx={{ borderRadius: "12px" }}
									size="large"
								>
									Buy
								</Button>
							</Box>
						</>
					)}
				</Grid>
				<Grid item xs={12} sm={5}>
					<Card variant="outlined">
						<CardContent>
							<Stack direction="column" spacing={2}>
								{savedArtworks.map((artwork) => (
									<Box
										key={artwork.id}
										sx={{
											display: "flex",
											alignItems: "center",
											my: 2,
										}}
									>
										<img
											src={artwork?.imageURL ?? ""}
											alt={artwork?.label ?? ""}
											style={{
												maxWidth: "60px",
												width: "100%",
												height: "auto",
												marginRight: "1rem",
											}}
										/>
										<Box>
											<Typography variant="h5" fontWeight="bold">
												{artwork?.label}
											</Typography>
											<Typography>
												Size: {artwork.saleDetails?.[0].size?.height} cm x{" "}
												{artwork.saleDetails?.[0].size?.width} cm
											</Typography>
											<Typography variant="h5" fontWeight="bold" mt={2}>
												{artwork.saleDetails?.[0].price} €
											</Typography>
										</Box>
									</Box>
								))}
								<Divider light />
								<Stack
									direction="row"
									justifyContent="flex-end"
									alignItems="center"
									mt={2}
								>
									<Typography variant="h5">Total:</Typography>
									<Typography variant="h4" fontWeight="bold">
										{totalPrice} €
									</Typography>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
					<Alert severity="success" sx={{ my: 2 }} color="info">
						<AlertTitle sx={{ fontWeight: "bold" }}>
							Your purchase is protected.
						</AlertTitle>
						Shop with confidence, your purchase is fortified!
					</Alert>
				</Grid>
			</Grid>
		</Box>
	);
};
const Checkout = () => {
	return (
		<StepperProvider>
			<CheckoutPage />
		</StepperProvider>
	);
};
export default Checkout;
