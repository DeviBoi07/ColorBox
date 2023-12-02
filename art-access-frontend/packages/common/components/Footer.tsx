import React, { useState } from "react";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { CaptureToCrmModal } from "../utils/crmAction";

export function Footer() {
	const [captureCrmReason, setCaptureCrmReason] = useState<string>();

	return (
		<footer
			style={{
				padding: "1rem",
				textAlign: "center",
				borderTop: "1px solid #ccc",
				marginTop: "2rem",
			}}
		>
			<Box sx={{ fontFamily: "sans-serif" }}>
				<Stack spacing={2} mb={3} direction="row" justifyContent="center">
					<Link
						component="button"
						onClick={(e) => {
							e.preventDefault();
							setCaptureCrmReason("Write me back");
						}}
						underline="none"
					>
						Contact us
					</Link>
					<BulletSeparator />
					<Link
						sx={{ my: "auto" }}
						underline="none"
						href="https://discord.gg/A2ZtrYkSw5"
						target="_blank"
					>
						Discord
					</Link>
					<BulletSeparator />
					<Link
						sx={{ my: "auto" }}
						underline="none"
						href="https://www.facebook.com/ColourBoxNFT"
						target="_blank"
					>
						Facebook
					</Link>
					<BulletSeparator />
					<Link
						sx={{ my: "auto" }}
						underline="none"
						href="https://twitter.com/colourBoxNFT"
						target="_blank"
					>
						Twitter
					</Link>
				</Stack>
				<Typography fontWeight={700} sx={{ my: "auto" }}>
					Copyright © {new Date().getFullYear()} New Earth Art & Tech LLC.
				</Typography>
				{captureCrmReason && (
					<CaptureToCrmModal
						allowReasonEdit
						title="How can we help"
						reason={captureCrmReason}
						onClose={() => setCaptureCrmReason(undefined)}
					/>
				)}
			</Box>
		</footer>
	);
}

function BulletSeparator() {
	return <span>&bull;</span>;
}
