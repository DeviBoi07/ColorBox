import { Box, Typography } from "@mui/material";

const NotFoundPage = () => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				mt: "20vh",
				textAlign: "center",
				background: "default",
				position: "relative",
			}}
		>
			<div>
				<Typography
					variant="h1"
					sx={{
						fontSize: "15rem",
						fontWeight: "bold",
						color: "error.main",
						opacity: "0.7",
					}}
				>
					404
				</Typography>
				<Typography
					variant="h4"
					sx={{
						fontSize: "1.5rem",
						fontWeight: "bold",
						marginTop: "2.4rem",
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, 50%)",
					}}
				>
					Page Not Found
				</Typography>
			</div>
		</Box>
	);
};

export default NotFoundPage;
