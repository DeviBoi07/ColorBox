// TypeScript interface for a Artwork
export interface Artwork {
	image: string;
	label: string;
}

// TypeScript array of instances for Artwork
export const mockArtworks: Artwork[] = [
	{
		image: "https://th.bing.com/th/id/OIG.kR8hBjFH54JiOM.RtUaW?pid=ImgGn",
		label: "Sunset over the mountains",
	},
	{
		image: "https://th.bing.com/th/id/OIG.ihLS4CnP_4C5ZrtPzsWt?pid=ImgGn",
		label: "A delicious plate of pasta",
	},
	{
		image: "https://th.bing.com/th/id/OIG.88OBGicXbBIiG5036NDD?pid=ImgGn",
		label: "Tuned BMW",
	},
];
