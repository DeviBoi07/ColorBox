/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["@colourbox/common"],
	images: {
		domains: ["*"],
	},
	experimental: { esmExternals: true },
};

module.exports = nextConfig;
