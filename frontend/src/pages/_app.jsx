import '@/styles/globals.css'
import Head from 'next/head'
import Footer from '@/components/footer'

export default function App({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>COSCUP 統計議程人數統計</title>
				<link href="https://coscup.org/2023/favicon.svg" rel="icon" type="image/svg+xml" />
			</Head>
			<div className="w-screen min-h-screen flex flex-col dark:bg-stone-950 dark:text-stone-50">
				<div className="w-full grow flex flex-col justify-center items-center">
					<h1 className="text-center text-2xl font-semibold mt-20 mb-5">COSCUP 議程人數統計</h1>
					<Component {...pageProps} />
				</div>
				<Footer />
			</div>
		</>
	)
}
