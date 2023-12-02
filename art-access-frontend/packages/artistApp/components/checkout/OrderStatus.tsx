import {
	ErrorString,
	IAsyncResult,
	ServerURI,
} from "@colourbox/common/utils/IAsyncResult";

import { useEffect, useState } from "react";
import { OrderStatusApi, OrderStatusResponse } from "@colourbox/ac-server";
import {
	Alert,
	Box,
	Step,
	StepLabel,
	Stepper,
	Typography,
} from "@mui/material";

export function OrderStatus({
	orderId,
	initialResponse,
}: {
	orderId: string;
	initialResponse?: OrderStatusResponse;
}) {
	const [status, setStatus] = useState<IAsyncResult<OrderStatusResponse>>({
		result: initialResponse,
	});

	useEffect(() => {
		(async () => {
			try {
				//todo:dee Implement updates on Timer
			} catch (error) {
				setStatus({ error: error as Error });
			}
		})();
	}, []);

	return (
		<Box>
			<Typography variant="h3" my={3}>
				Order Status
			</Typography>
			<Stepper activeStep={status.result?.updates?.length || 0} sx={{ mx: 3 }}>
				{(status?.result?.updates ?? []).map((u, i) => (
					<Step key={i}>
						<StepLabel optional={u.created}>
							<Typography>{u.message}</Typography>
						</StepLabel>
					</Step>
				))}
			</Stepper>
		</Box>
	);
}
