// These are stylings for generating a blurred, almost transparent bg

export const glassBackgroundStyle = (color = "#ffffff1e") => {
	return {
		backdropFilter: "blur(15px) saturate(160%)",
		WebkitBackdropFilter: "blur(15px) saturate(160%)",
		backgroundColor: color,
		borderRadius: "12px",
	};
};
