interface IAsyncResultBase {
	isLoading?: boolean;
	loadingPrompt?: string;
	error?: Error;
}

export interface IAsyncResult<T> extends IAsyncResultBase {
	result?: T;
}

export function ErrorString( error : Error | undefined ) {
	if (error === null || error === undefined) return "Unknown error";
  
	return error.message ?? `failed :${error.toString()}`;
}

export const ServerURI ={
	clientSide: process.env.NEXT_PUBLIC_API_URL?? "http://localhost:5123",
	serverSide: process.env.NEXT_PUBLIC_SSR_API_URL ?? "http://localhost:5123"
};
