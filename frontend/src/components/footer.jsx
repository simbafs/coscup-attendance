export default function Footer() {
	return (
		<footer className="flex justify-center items-center flex-col pb-8 pt-4 w-full bg-gray-100">
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
				with 🐈
			</p>
		</footer>
	)
}
