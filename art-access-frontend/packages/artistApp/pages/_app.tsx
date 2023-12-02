/* eslint-disable react/jsx-key */
import Head from "next/head";
import type { AppProps } from "next/app";
import AuthProvider from "@/auth/AuthProvider";
import AppTheme from "@colourbox/common/AppTheme";
import Layout from "@colourbox/common/Layout";
import { Toaster } from "react-hot-toast";
import { Link } from "@mui/material";
import ChatDialog from "@/components/chat/ChatDialog";

export default function App({ Component, pageProps }: AppProps) {
	/* 	const { isAuthenticated } = useAuth0(); */
	const navItems = [
		<Link href="/artworks" underline="none" fontFamily="sans-serif" mx={1}>
			Gallery
		</Link>,
		/* <Link href="/artists" underline="none" fontFamily="sans-serif" mx={1}>
			Artists
		</Link>,
		isAuthenticated && (
			<Link
				href="/create-artwork"
				my="auto"
				underline="none"
				fontFamily="sans-serif"
				mx={1}
			>
				Create Artwork
			</Link>
		),
		isAuthenticated && (
			<Link
				href="/saved"
				my="auto"
				underline="none"
				fontFamily="sans-serif"
				mx={1}
			>
				Saved for later
			</Link>
		), */
		/* <AuthButton />, */
	];
	return (
		<>
			<Head>
				<title>Colourbox</title>
				<meta name="description" content="Colourbox Project" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<AuthProvider>
				<AppTheme>
					<Toaster />
					<Layout navItems={navItems}>
						<Component {...pageProps} />
						{/*<ChatDialog />*/}
					</Layout>
				</AppTheme>
			</AuthProvider>
		</>
	);
}
