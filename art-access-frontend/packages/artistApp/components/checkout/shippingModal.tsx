import { CaptureToCrmComponent } from "@colourbox/common/utils/crmAction";
import { Close } from "@mui/icons-material";
import {
  Modal,
  Box,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { StripePaymentIntent } from "@colourbox/ac-server";
import {
  ErrorString,
  IAsyncResult,
} from "@colourbox/common/utils/IAsyncResult";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
import { StripePay } from "./StripePayModal";

type ShippingZone = {
  country: string;
  isSupported: boolean;
};

const shippingZones: ShippingZone[] = [
  { country: "United States of America", isSupported: true },
  { country: "other", isSupported: false },
];

export function ShippingModal({
  getIntent,
  onCancel,
}: {
  onCancel: () => any;
  getIntent: () => Promise<StripePaymentIntent>;
}) {
  const [selectedZone, setSelectedZone] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] =
    useState<IAsyncResult<StripePaymentIntent>>();

  useEffect(() => {
    
    if (!!paymentDetails) return;

    if(!shippingZones[selectedZone].isSupported){
        return;
    }

    setPaymentDetails({ isLoading: true });
    (async () => {
      try {
        const result = await getIntent();
        setPaymentDetails({ result });
      } catch (error) {
        setPaymentDetails({ error: error as Error });
      }
    })();
  }, [selectedZone]);

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

        <Typography variant="h5" sx={{ fontWeight: 300 }}>
          Ship to
        </Typography>
        <Box sx={{ my: 1 }}>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={selectedZone}
            onChange={(e) => setSelectedZone(Number(e.target.value))}
            renderValue={() => {
              return (
                <Typography>{shippingZones[selectedZone].country}</Typography>
              );
            }}
            placeholder="Select a Size"
            sx={{
              overflowClipMargin: "content-box",
              overflow: "clip",
            }}
          >
            <MenuItem disabled value="">
              <em>Select country to ship to</em>
            </MenuItem>
            {shippingZones.map((zone, i) => (
              <MenuItem value={i} key={i} sx={{ textAlign: "left" }}>
                {shippingZones[i].country}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {shippingZones[selectedZone].isSupported ? (
          <Box>
            {paymentDetails?.isLoading && <LoadingSpinner />}
            {paymentDetails?.error && (
              <Alert severity="error">
                {ErrorString(paymentDetails.error)}
              </Alert>
            )}

            {paymentDetails?.result && (
              <StripePay intent={paymentDetails?.result} />
            )}
          </Box>
        ) : (
          <Box sx={{ marginTop: 5 }}>
            <CaptureToCrmComponent
              reason={`order print `}
              onClose={() => onCancel()}
            />
          </Box>
        )}
      </Box>
    </Modal>
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
