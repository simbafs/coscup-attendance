import Head from 'next/head'
import { useReducer, useState, useEffect } from 'react'
import { useDebounce } from 'usehooks-ts'
import useSWR from 'swr'
import useLocalStorageReducer from '@/libs/useLocalStorageReducer'
import { io } from 'socket.io-client'
import shouldParse from '@/libs/shouldParse'
import Footer from '@/components/footer'
import { useRouter } from 'next/router'
import box from '@/variants/box'

export default function Home() {
	const router = useRouter()
	const [token, setToken] = useState(router.query.token || '')
	const [valid, setValid] = useState(false)

	useEffect(() => {
		fetch(`/api/verify?token=${token}`)
			.then(res => res.json())
			.then(data => {
				if (data.status === 'ok') {
					setValid(true)
					router.push(`/?token=${token}`)
				}
			})
	}, [token])

	useEffect(() => {
		if (router.query.token) setToken(router.query.token)
	}, [router.query.token])

	return (
		<>
			<Head>
				<title>製播組統計議程人數統計</title>
				<link
					href="https://coscup.org/2023/favicon.svg"
					rel="icon"
					type="image/svg+xml"
				/>
			</Head>
			<div className="w-screen min-h-screen flex flex-col">
				<div className="w-full grow flex flex-col justify-center items-center">
					<h1 className="text-center text-2xl font-semibold">
						製播組議程人數統計
					</h1>
					{valid ? (
						<WithToken token={token} />
					) : (
						<form onSubmit={e => {
							e.preventDefault()
						}}>
							<h1 className="text-center text-xl">請輸入 Token</h1>
							<input
								type="text"
								className={box({ borderColor: valid ? 'success' : 'error' })}
								value={token}
								onChange={e => setToken(e.target.value)}
							/>
						</form>
					)}
				</div>
				<Footer />
			</div>
		</>
	)

}

function WithToken({ token }) {
	const { data, error } = useSWR(
		`https://coscup.org/2023/json/session.json?token=${token}`,
		url => fetch(url).then(res => res.json())
	)
	const [socket, setSocket] = useState(undefined)
	const [attendance, updateAttendance] = useReducer((state, action) => {
		if (action.overwrite) {
			return action.data
		}
		if (!state) return state

		const r = { ...state }
		r[action.day][action.room][action.id] = Number(action.attendance)
		return r
	}, undefined)

	// init attendance
	useEffect(() => {
		console.log('fetching attendance')
		fetch(`/api/attendance?token=${token}`)
			.then(res => res.json())
			.then(data => updateAttendance({ data, overwrite: true }))
			.then(() => console.log('attendance loaded'))
	}, [])

	useEffect(() => {
		const socket = io({
			auth: { token },
		})

		// log socket connection
		socket.on('connect', () => {
			console.log('SOCKET CONNECTED!', socket.id)
			setSocket(socket)
		})

		socket.on('disconnect', () => {
			console.log("SOCKET DISCONNECTED!")
			setSocket(undefined)
		})

		socket.on('attendance', data => {
			const diffs = shouldParse(data, [])
			for (let diff of diffs) {
				updateAttendance(diff)
			}
		})

		// socket disconnet onUnmount if exists
		if (socket) return () => {
			socket.disconnect()
		}
	}, [])

	useEffect(() => console.log({ token }), [token])

	return <>
		{socket ? (
			<p className="text-green-500" key="connect">Connected id: {socket.id}</p>
		) : (
			<p className="text-red-500" key="disconnect">Disconnected</p>
		)}
		{error ? (
			<div>
				<h1>Fail to laod data:</h1>
				<pre>{JSON.stringify(error, null, 2)}</pre>
			</div>
		) : data && attendance ? (
			<Table
				sessions={data.sessions}
				attendance={attendance}
				updateAttendance={updateAttendance}
				connected={!!socket}
			/>
		) : (
			<div className="text-center my-4">Loading...</div>
		)}
	</>
}

function customSort(a, b) {
	// Check if 'AU' or 'RB 105' are present in the array
	const isAFirst = a === 'AU' || a === 'RB 105'
	const isBFirst = b === 'AU' || b === 'RB 105'

	// Sort 'AU' or 'RB 105' before others
	if (isAFirst && !isBFirst) {
		return -1
	} else if (!isAFirst && isBFirst) {
		return 1
	}

	// Sort other elements based on XXX in `TR XXX`
	const aText = a.replace('TR ', '')
	const bText = b.replace('TR ', '')

	let aNum
	let bNum

	if (aText.includes('-')) {
		aNum = Number(`${aText.split('-')[0]}.${aText.split('-')[1]}`)
	} else {
		aNum = Number(aText)
	}

	if (bText.includes('-')) {
		bNum = Number(`${bText.split('-')[0]}.${bText.split('-')[1]}`)
	} else {
		bNum = Number(bText)
	}

	return aNum - bNum
}

function Table({ sessions, attendance, updateAttendance, connected }) {
	const rooms = Array.from(new Set(sessions.map(i => i.room))).sort(
		customSort
	)

	const [day, setDay] = useLocalStorageReducer(
		'day',
		(oldDay, newDay) => {
			if (newDay == 29 || newDay == 30) {
				return newDay
			}
			return oldDay
		},
		29
	)
	const [room, setRoom] = useLocalStorageReducer(
		'room',
		(oldRoom, newRoom) => {
			if (rooms.includes(newRoom)) {
				return newRoom
			}
			return oldRoom
		},
		'AU'
	)

	const [diff, setDiff] = useState([])
	const debuuncedDiff = useDebounce(diff, 300)

	useEffect(() => {
		if (debuuncedDiff.length == 0) return
		fetch('/api/attendance', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(debuuncedDiff),
		})
			.then(res => res.json())
			.then(console.log)
			.catch(console.error)
			.finally(() => setDiff([]))
		// .then(setAttendance)
	}, [debuuncedDiff])

	const appendDiff = update => {
		setDiff(diff =>
			diff.concat(update).reduce((arr, item) => {
				const pre = arr.findIndex(i => i.id == item.id)
				if (pre >= 0) {
					arr[pre] = item
				} else {
					arr = arr.concat(item)
				}

				return arr
			}, [])
		)
		updateAttendance(update)
	}

	// init day and room
	useEffect(() => {
		if (!localStorage) return

		let day = localStorage.getItem('day')
		let room = localStorage.getItem('room')

		if (day) {
			setDay(day)
		}
		if (room) {
			setRoom(room)
		}
	}, [])

	let groupedSessions = groupBy(
		sessions.filter(item => new Date(item.start).getDate() == day),
		'room'
	)[room]
	// sort by start time
	groupedSessions.sort((a, b) => {
		let timeA = new Date(a.start)
		let timeB = new Date(b.start)
		return timeA - timeB
	})

	return (
		<>
			<div className="text-center my-4">
				<select
					value={day}
					onChange={e => setDay(e.target.value)}
					className={box()}
				>
					<option value={29}>7/29</option>
					<option value={30}>7/30</option>
				</select>
				的
				<select
					value={room}
					onChange={e => setRoom(e.target.value)}
					className={box()}
				>
					{rooms.map(room => (
						<option key={room} value={room}>
							{room}
						</option>
					))}
				</select>
				廳
			</div>
			<hr className="my-4" />

			<div className="grid grid-cols-[110px_100px_4fr] lg:gap-2 gap-4">
				{groupedSessions.map(s => (
					<Session
						key={s.id}
						session={s}
						attendance={attendance[day][s.room][s.id]}
						setAttendance={n =>
							appendDiff({
								day: day,
								room: s.room,
								id: s.id,
								attendance: n,
							})
						}
						connected={connected}
					/>
				))}
			</div>
		</>
	)
}

function groupBy(arr, key) {
	let result = {}
	arr.forEach(item => {
		let value = item[key]
		if (!result[value]) {
			result[value] = []
		}
		result[value].push(item)
	})
	return result
}

function getFormatedDate(dateStr) {
	let time = new Date(dateStr)
	let to2 = n => (n < 10 ? `0${n}` : `${n}`)

	return `${to2(time.getHours())}:${to2(time.getMinutes())}`
}

function Session({ session, attendance, setAttendance, connected }) {
	return (
		<>
			<div className="my-auto">
				<span>
					{getFormatedDate(session.start)} -{' '}
					{getFormatedDate(session.end)}
				</span>
			</div>
			<input
				type="number"
				value={attendance}
				min={0}
				onChange={e => setAttendance(e.target.value)}
				className={box()}
				disabled={!connected}
			/>
			<div className="my-auto">
				<span className="text-right break-words">
					{session.zh.title}
				</span>
			</div>
		</>
	)
}
