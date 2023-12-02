import React, { useEffect, useState } from "react";
import {
	AppBar,
	Box,
	Button,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	Toolbar,
	Typography,
} from "@mui/material";
import { glassBackgroundStyle } from "./styling/Glassmorphism";
import MenuIcon from "@mui/icons-material/Menu";
interface NavbarProps {
	title?: string;
	navItems?: React.ReactNode[];
	links?: {
		link: string;
		label: string;
	}[];
}

const Navbar: React.FC<NavbarProps> = ({ title, navItems }: NavbarProps) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	const [backUrl, setBackUrl] = useState<string>();

	useEffect(() => {
		setTimeout(() => {
			if (
				typeof window === "object" &&
				document?.referrer &&
				!document?.referrer.includes(window.location.host)
			) {
				const referral = document?.referrer;
				setBackUrl(referral);
				localStorage.setItem("referral", referral);
			} else {
				const storedReferral = localStorage.getItem("referral");
				if (storedReferral) {
					setBackUrl(storedReferral);
				}
			}
		}, 100);
	}, []);

	const handleDrawerToggle = () => {
		setMobileOpen((prevState) => !prevState);
	};
	return (
		<>
			<AppBar position="sticky" color="transparent" sx={glassBackgroundStyle()}>
				<Toolbar>
					<img src="/cb-logo.png" style={{ maxHeight: "40px" }} />

					{backUrl && (
						<Button onClick={() => (document.location = backUrl)}>
							Go Back
						</Button>
					)}

					<Typography
						variant="h4"
						component="div"
						sx={{
							flexGrow: 1,
							mx: 1,
						}}
					>
						{title}
					</Typography>

					{navItems?.map((navItem, i) => (
						<Box key={i} sx={{ display: { xs: "none", sm: "block" } }}>
							{navItem}
						</Box>
					))}

					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}
					>
						<MenuIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={handleDrawerToggle}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				sx={{
					display: { xs: "block", sm: "none" },
					"& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
				}}
			>
				<Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
					<List>
						{navItems
							?.filter((x) => x)
							.map((navItem, i) => (
								<ListItem key={i}>
									<ListItemButton sx={{ textAlign: "center" }}>
										{navItem}
									</ListItemButton>
								</ListItem>
							))}
					</List>
				</Box>
			</Drawer>
		</>
	);
};

export default Navbar;
