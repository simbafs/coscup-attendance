// components
import Footer from '@/components/footer'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import box from '@/variants/box'
import { Header } from '@/components/header'

export default function Token() {
	const router = useRouter()
	const [token, setToken] = useState('')
	const [valid, setValid] = useState(false)

	useEffect(() => {
		let t = router.query.token
		if (!t) return
		if (router.query.token) {
			t = Array.isArray(t) ? t[0] : t
			setToken(t)
			checkToken(t)
		}
	}, [router.query.token, checkToken])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function checkToken(token: string) {
		fetch(`/api/verify?token=${token}`)
			.then(res => res.json())
			.then(data => {
				if (data.status === 'ok') {
					setValid(true)
					router.push(`/?token=${token}`)
				}
			})
	}

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				checkToken(token)
			}}
		>
			<h1 className="text-center text-xl">請輸入 Token</h1>
			<input
				type="text"
				className={box({
					borderColor: valid ? 'success' : 'error',
				})}
				value={token}
				onChange={e => setToken(e.target.value)}
			/>
			<button type="submit">Check Token</button>
		</form>
	)
}
