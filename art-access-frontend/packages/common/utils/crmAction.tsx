//This class pops a Modal and captures UserInfo
import React from "react";
import {
  IAsyncResult,
  ServerURI,
  ErrorString,
} from "@colourbox/common/utils/IAsyncResult";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { CrmApi, ContactDetails } from "@colourbox/ac-server";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Close } from "@mui/icons-material";
import { isValidEmail, isValidPhoneNumber } from "./validation";
const style = {
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

export function CaptureToCrmComponent({
  title,
  allowReasonEdit,
  reason,
  onClose,
}: {
  title?: string;
  allowReasonEdit?: boolean;
  reason: string;
  onClose: () => void;
}) {
  const crmApi = new CrmApi(undefined, ServerURI.clientSide);
  //@ts-ignore
  const [crmDetails, setCrmDetails] = useState<ContactDetails>({ reason });
  const [submitted, setSubmitted] = useState<IAsyncResult<string>>();
  const [errors, setErrors] = useState<{ email: string; phoneNumber: string }>({
    email: "",
    phoneNumber: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", phoneNumber: "" };

    if (!crmDetails.email && !crmDetails.phoneNumber) {
      newErrors.email = "Email or Phone Number is required";
      newErrors.phoneNumber = "Email or Phone Number is required";
      isValid = false;
    } else {
      if (crmDetails.email && !isValidEmail(crmDetails.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (
        crmDetails.phoneNumber &&
        !isValidPhoneNumber(crmDetails.phoneNumber)
      ) {
        newErrors.phoneNumber = "Please enter a valid phone number";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitted({ isLoading: true });
      await crmApi.apiCrmUpdateDetailsPost(crmDetails);

      setSubmitted({ result: "We have saved your details" });

      setTimeout(() => onClose(), 1000 * 5);
    } catch (error) {
      setSubmitted({ error: error as Error });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {submitted?.error && (
          <Alert severity="error">{ErrorString(submitted.error)}</Alert>
        )}

        {submitted?.result && <Alert severity="info">{submitted.result}</Alert>}

        <Typography variant="h5" component="h2" id="modal-modal-title">
          {title || "We need to get back to you about this"}
        </Typography>

        <fieldset
          //@ts-ignore
          disabled={submitted?.isLoading || submitted?.result}
          style={{ border: 0, padding: 0 }}
        >
          {/*todo:GREG please make this a multiline edit AND fix the spacings */}
          {allowReasonEdit && (
            <>
              <TextField
                id="reason"
                label="Message"
                multiline
                value={crmDetails?.reason}
                variant="outlined"
                placeholder="reason"
                onChange={(event) =>
                  setCrmDetails({ ...crmDetails, reason: event.target.value })
                }
                sx={{ maxWidth: "35rem", my: 1 }}
                fullWidth
              />
              <hr />
            </>
          )}

          <Typography
            sx={{ my: 1, color: "text.secondary" }}
            id="modal-modal-description"
          >
            Can we have your contact details, please?
          </Typography>

          <TextField
            id="email"
            label="Email"
            value={crmDetails?.email}
            variant="outlined"
            placeholder="user12345@example.com"
            onChange={(event) =>
              setCrmDetails({ ...crmDetails, email: event.target.value })
            }
            sx={{ maxWidth: "35rem", my: 1 }}
            fullWidth
            error={!!errors.email}
            helperText={errors.email}
          />
          <Box display="flex" alignItems="center" mt={2} mb={2}>
            <Divider flexItem sx={{ flexGrow: 1, my: "auto" }} />
            <Typography variant="body2" sx={{ mx: 2 }}>
              AND/OR
            </Typography>
            <Divider flexItem sx={{ flexGrow: 1, my: "auto" }} />
          </Box>
          <TextField
            id="phoneNumber"
            label="Phone Number"
            variant="outlined"
            placeholder="+1 555 123-4567"
            value={crmDetails?.phoneNumber}
            onChange={(event) =>
              setCrmDetails({
                ...crmDetails,
                phoneNumber: event.target.value,
              })
            }
            sx={{ maxWidth: "35rem" }}
            fullWidth
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            maxlength="16"
          />
          {/*changes made*/}
          <Box sx={{ textAlign: "right", mt: 6 }}>
            <LoadingButton
              loading={submitted?.isLoading}
              type="submit"
              size="large"
              variant="contained"
              sx={{ borderRadius: "24px" }}
            >
              Submit
            </LoadingButton>
          </Box>
        </fieldset>
      </form>
    </>
  );
}

export function CaptureToCrmModal({
  title,
  allowReasonEdit,
  reason,
  onClose,
}: {
  title?: string;
  allowReasonEdit?: boolean;
  reason: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={true}
      onClose={() => onClose()}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={() => onClose()}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>

        <CaptureToCrmComponent
          {...{ title, allowReasonEdit, reason, onClose }}
        />
      </Box>
    </Modal>
  );
}
