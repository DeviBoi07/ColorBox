import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Button, Link, Stack } from "@mui/material";

const Profile = () => {
	const { user, loginWithRedirect, logout, isAuthenticated, isLoading } =
		useAuth0();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			{isAuthenticated && (
				<Stack direction="row" spacing={2}>
					<Link href="/profile">
						<Avatar alt={user?.name} src={user?.picture} />
					</Link>
					<Button
						color="error"
						variant="contained"
						sx={{
							borderRadius: "24px",
							px: "20px",
						}}
						onClick={() => logout()}
					>
						Logout
					</Button>
				</Stack>
			)}
			{!isAuthenticated && (
				<Button
					color="primary"
					variant="contained"
					onClick={() => loginWithRedirect()}
					sx={{
						borderRadius: "24px",
						px: "20px",
					}}
				>
					Login
				</Button>
			)}
		</>
	);
};

export default Profile;
