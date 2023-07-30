import Head from 'next/head'
import { useReducer, useState, useEffect } from 'react'
import { useDebounce } from 'usehooks-ts'

export async function getStaticProps() {
	let data = await fetch('https://coscup.org/2023/json/session.json').then(
		res => res.json()
	)
	let attendanceInit = await fetch('http://localhost:3000/api/attendance', {
		method: 'GET',
	}).then(res => res.json())

	return {
		props: {
			data,
			attendanceInit,
		},
	}
}

export default function Home({ data, attendanceInit }) {
	const rooms = Array.from(new Set(data.sessions.map(i => i.room)))
	const [day, setDay] = useState(29)
	const [room, setRoom] = useReducer((oldRoom, newRoom) => {
		if (rooms.includes(newRoom)) {
			return newRoom
		}
		return oldRoom
	}, 'AU')

	const [diff, setDiff] = useState([])

	// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
	const [attendance, updateAttendance] = useReducer((curr, update) => {
		let r = {
			29: curr[29],
			30: curr[30],
		}
		r[update.day][update.room][update.id] = update.attendance

		setDiff(diff => diff.concat(update))

		return r
	}, attendanceInit)
	const debonseedAttendance = useDebounce(attendance, 1000)

	useEffect(() => {
		let filterdDiff = diff.reduce((arr, item) => {
			const pre = arr.findIndex(i => i.id == item.id)
			if (pre >= 0) {
				arr[pre] = item
			} else {
				arr = arr.concat(item)
			}

			return arr
		}, [])

		fetch('http://localhost:3000/api/attendance', {
			method: 'POST',
			body: JSON.stringify(filterdDiff),
		})
			.then(res => res.json())
			.then(console.log)

		setDiff([])
	}, [debonseedAttendance])

	let sessions = groupBy(
		data.sessions.filter(item => new Date(item.start).getDate() == day),
		'room'
	)[room]
	// sort by start time
	sessions.sort((a, b) => {
		let timeA = new Date(a.start)
		let timeB = new Date(b.start)
		return timeA - timeB
	})

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
			<h1>製播組統計議程人數統計</h1>
			<select value={day} onChange={e => setDay(e.target.value)}>
				<option value={29}>29</option>
				<option value={30}>30</option>
			</select>
			<select value={room} onChange={e => setRoom(e.target.value)}>
				{rooms.map(room => (
					<option key={room} value={room}>
						{room}
					</option>
				))}
			</select>
			{sessions.map(s => (
				<Session
					key={s.id}
					session={s}
					attendance={attendance[day][s.room][s.id]}
					setAttendance={n =>
						updateAttendance({
							day: day,
							room: s.room,
							id: s.id,
							attendance: n,
						})
					}
				/>
			))}
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

function Session({ session, attendance, setAttendance }) {
	return (
		<>
			<div className="w-screen space-x-2">
				<span>
					{getFormatedDate(session.start)}-
					{getFormatedDate(session.end)}
				</span>
				<span>{session.zh.title}</span>
				<input
					type="number"
					value={attendance}
					onChange={e => setAttendance(e.target.value)}
				/>
			</div>
		</>
	)
}
