import { useState } from 'react'

export default function Footer() {
	const [click, setClick] = useState(0)
	return (
		<footer className="flex justify-center items-center flex-col pb-8 pt-4 w-full bg-gray-100 dark:bg-stone-950 dark:text-stone-50">
			<p>
				Repo at{' '}
				<a
					href="https://github.com/simbafs/coscup-attendance"
					className="text-blue-500 underline hover:underline-offset-0"
					target="_blank"
				>
					simbafs/coscup-attendance
				</a>
			</p>
			<p>
				Made by{' '}
				<a
					href="https://github.com/simbafs"
					className="text-blue-500 underline hover:underline-offset-0"
					target="_blank"
				>
					SimbaFs
				</a>{' '}
				with <span onClick={() => setClick(c => c + 1)}>🐈</span>
			</p>
			{click > 7 && <p>可愛俊勝！</p>}
		</footer>
	)
}
