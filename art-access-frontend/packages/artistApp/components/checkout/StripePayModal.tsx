import {
	ErrorString,
	IAsyncResult,
} from "@colourbox/common/utils/IAsyncResult";
import { Close } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	IconButton,
	Modal,
	Typography,
} from "@mui/material";
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
import { Appearance, Stripe, loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

const ELEMENTS_OPTIONS: Appearance = {
	theme: "flat",
	variables: {
		colorPrimary: "#1D3557",
		colorBackground: "#f5f5f5",
		colorDanger: "#f50057",
	},
};
import { StripePaymentIntent } from "@colourbox/ac-server";

function CheckoutForm({ intent }: { intent: StripePaymentIntent }) {
	const stripe = useStripe();
	const elements = useElements();
	elements?.update({ appearance: ELEMENTS_OPTIONS });
	const [submitted, setSubmitted] = useState<IAsyncResult<boolean>>();

	return (
		<form>
			{submitted?.result ? (
				<h2>Payment completed, redirecting ...</h2>
			) : (
				<>
					<PaymentElement
						options={{ wallets: { applePay: "auto", googlePay: "auto" } }}
					/>

					{submitted?.error && (
						<Alert severity="error">{ErrorString(submitted.error)}</Alert>
					)}

					<Box sx={{ textAlign: "center", m: 4 }}>
						{submitted?.isLoading && <LoadingSpinner />}
						<Button
							sx={{ mx: "auto", borderRadius: "24px" }}
							variant="contained"
							size="large"
							disabled={submitted?.isLoading}
							onClick={async (e) => {
								try {
									e.stopPropagation();
									setSubmitted({ isLoading: true });

									if (!stripe || !elements) {
										throw new Error("stripe no yet loaded");
									}

									const result = await stripe.confirmPayment({
										// `Elements` instance that was used to create the Payment Element
										elements,
										confirmParams: {
											return_url: intent.redirectUrl,
										},
									});

									if (result.error) {
										// Show error to your customer (for example, payment details incomplete)
										// console.log(result.error.message)
										throw new Error(`payment failed: ${result.error.message}`);
									} else {
										// Your customer will be redirected to your `return_url`. For some payment
										// methods like iDEAL, your customer will be redirected to an intermediate
										// site first to authorize the payment, then redirected to the `return_url`.
										setSubmitted({ result: true });
									}
								} catch (error: any) {
									setSubmitted({ error });
								}
							}}
						>
							Submit payment
						</Button>
					</Box>
				</>
			)}
		</form>
	);
}

export function StripePay({ intent }: { intent: StripePaymentIntent }) {
	const [payment, setPayment] = useState<
		IAsyncResult<{
			stripe: Stripe;
		}>
	>();

	useEffect(() => {
		(async () => {
			try {
				setPayment({ isLoading: true });

				const stripe = await loadStripe(intent.stripeKey, {
					apiVersion: "2022-08-01",
					//stripeAccount: intent.connectedAccount
				});

				if (!stripe) throw new Error("failed to load Stripe");

				console.log(`payment: loading intent id - ${intent.redirectUrl}`);

				setPayment({
					result: {
						stripe,
					},
				});
			} catch (error: any) {
				setPayment({ error });
			}
		})();
	}, []);

	return (
		<>
			<Typography variant="h5" component="h2" id="modal-modal-title">
				Payment
			</Typography>

			<Typography
				sx={{ my: 1, color: "text.secondary" }}
				id="modal-modal-description"
			>
				details, please?
			</Typography>

			{payment?.isLoading && <LoadingSpinner />}

			{payment?.error && (
				<Alert severity="error">{ErrorString(payment.error)}</Alert>
			)}

			{payment?.result && (
				<Elements
					stripe={payment?.result.stripe}
					options={{
						clientSecret: intent.clientSecret,
					}}
				>
					<CheckoutForm intent={intent} />
				</Elements>
			)}
		</>
	);
}

const modalStyle = {
	position: "absolute" as "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #0000008e",
	borderRadius: 4,
	boxShadow: 24,
	p: 4,
};

export function StripePayModal({
	intent,
	onCancel,
}: {
	intent: StripePaymentIntent;
	onCancel: () => any;
}) {
	return (
		<Modal
			open={true}
			onClose={() => onCancel()}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<IconButton
					aria-label="close"
					onClick={() => onCancel()}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
					}}
				>
					<Close />
				</IconButton>
				<StripePay intent={intent} />
			</Box>
		</Modal>
	);
}
