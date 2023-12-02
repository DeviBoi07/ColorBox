import React from "react";
import Navbar from "./Navbar";
import { Box } from "@mui/material";
import {Footer} from "./components/Footer";

interface IProps {
	children: React.ReactNode;
	title?: string;
	navItems?: React.ReactNode[];
}

const Layout = ({ children, title, navItems }: IProps) => {
	return (
		<div>
			<Navbar title={title} navItems={navItems} />
			<Box p={4}>{children}</Box>
			<Footer/>
		</div>
	);
};

export default Layout;
