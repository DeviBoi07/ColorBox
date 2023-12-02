import { createTheme } from "@mui/material/styles";
import "@fontsource/poppins";

const theme = createTheme({
	palette: {
		primary: {
			main: "#1D3557",
		},
		secondary: {
			main: "#f50057",
		},
		background: {
			default: "#f5f5f5",
		},
	},

	typography: {
		fontFamily: "Poppins, Arial",
		fontSize: 14,
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
		h1: {
			fontSize: "2.5rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "-0.01562em",
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "-0.00833em",
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "0em",
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "0.00735em",
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "0em",
		},
		h6: {
			fontSize: "1rem",
			fontWeight: 500,
			lineHeight: 1.2,
			letterSpacing: "0.0075em",
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 0,
				},
			},
			variants: [
				{
					props: { variant: "contained", color: "primary" },
					style: {
						background: "#1D3557",
						color: "#fff",
					},
				},
				{
					props: { variant: "outlined", color: "primary" },
					style: {
						border: "1px solid #1D3557",
						color: "#1D3557",
					},
				},
				{
					props: { variant: "contained", color: "secondary" },
					style: {
						background: "#f50057",
						color: "#fff",
					},
				},
				{
					props: { variant: "outlined", color: "secondary" },
					style: {
						border: "1px solid #f50057",
						color: "#f50057",
					},
				},
			],
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				label: {
					fontSize: "0.875rem",
				},
			},
		},
	},
});

export default theme;
