const isProd = process.env.NODE_ENV === 'production'

console.log('isProd', isProd)

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	assetPrefix: isProd ? 'https://coscup.simbafs.cc' : '',
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Accelss-Control-Allow-Origin', value: '*' }, // replace this your actual origin
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,POST',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
					},
				],
			},
		]
	},
}

module.exports = nextConfig
