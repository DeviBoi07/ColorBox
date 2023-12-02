import React from "react";
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";

type LoadingSpinnerProps = {
	progressSize?: number;
} & SxProps<Theme>;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	progressSize = 48,
	...props
}) => {
	return (
		<Box sx={{ mx: "auto", ...props }}>
			<CircularProgress size={progressSize} />
		</Box>
	);
};

export default LoadingSpinner;
