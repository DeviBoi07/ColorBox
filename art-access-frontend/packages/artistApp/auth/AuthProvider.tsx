import { Auth0Provider } from "@auth0/auth0-react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore enforcing VITE env
	const domain =
		process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? "dev-divine.us.auth0.com";
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore enforcing VITE env
	const clientId =
		process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ??
		"kbNMJ5OAyWXJigbZCzqLnzAcCtgpwoCN";

	return (
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			authorizationParams={{
				redirect_uri:
					process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ??
					"https://localhost:5173",
				audience:
					process.env.NEXT_PUBLIC_AUDIENCE ?? "https://art-colourbox-api/",
				scope: "read:current_user update:current_user_metadata",
			}}
		>
			{children}
		</Auth0Provider>
	);
};
export default AuthProvider;
