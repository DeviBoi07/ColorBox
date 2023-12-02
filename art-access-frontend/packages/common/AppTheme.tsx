import React from "react";
import theme from "./theme";
import { ThemeProvider } from "@mui/material";

interface IProps {
	children: React.ReactNode;
}

const AppTheme = ({ children }: IProps) => {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default AppTheme;
