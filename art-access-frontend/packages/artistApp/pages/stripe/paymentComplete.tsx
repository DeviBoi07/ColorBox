import {
	ErrorString,
	IAsyncResult,
	ServerURI,
} from "@colourbox/common/utils/IAsyncResult";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { OrderStatusApi, OrderStatusResponse } from "@colourbox/ac-server";
import { Alert, Box } from "@mui/material";
import { OrderStatus } from "@/components/checkout/OrderStatus";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";

export default function StripePaymentCompleted() {
	//http://localhost:3000/stripe/paymentComplete?payment_intent=pi_3NNiZuHFENTZy0Z81wKf3uqG&payment_intent_client_secret=pi_3NNiZuHFENTZy0Z81wKf3uqG_secret_ZkHTVgvAp7jhsIoJIfRAMdaFE&redirect_status=succeeded
	const {
		query: { payment_intent },
	} = useRouter();
	const [status, setStatus] = useState<IAsyncResult<OrderStatusResponse>>();

	useEffect(() => {
		(async () => {
			try {
				setStatus({ isLoading: true });

				if (!payment_intent) {
					console.debug("payment_intent is null");
					return;
				}

				const orderStatusApi = new OrderStatusApi(
					undefined,
					ServerURI.clientSide
				);

				const { data: result } =
					await orderStatusApi.apiOrderStatusByPaymentIdPaymentIdGet(
						payment_intent.toString()
					);

				setStatus({ result });
			} catch (error) {
				setStatus({ error: error as Error });
			}
		})();
	}, [payment_intent]);

	return (
		<Box>
			{status?.isLoading && <LoadingSpinner />}

			{status?.error && (
				<Alert severity="error">{ErrorString(status.error)}</Alert>
			)}

			{status?.result && (
				<OrderStatus
					orderId={status.result.orderId}
					initialResponse={status.result}
				/>
			)}
		</Box>
	);
}
