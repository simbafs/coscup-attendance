import Head from 'next/head'
import { useReducer, useState } from 'react'

export async function getStaticProps() {
	let data = await fetch('http://localhost:3000/session.json').then(res =>
		res.json()
	)

	return {
		props: {
			data,
		},
	}
}

export default function Home({ data }) {
	let rooms = Array.from(new Set(data.sessions.map(i => i.room)))
	let [day, setDay] = useState(29)
	let [room, setRoom] = useReducer((oldRoom, newRoom) => {
		if (rooms.includes(newRoom)) {
			return newRoom
		}
		return oldRoom
	}, 'AU')

	// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
	let [attendance, updateAttendance] = useReducer(
		(curr, update) => {
			let r = {
				29: curr[29],
				30: curr[30],
			}
			r[update.day][update.room][update.id] = update.attendance

			return r
		},
		{
			29: Object.fromEntries(rooms.map(i => [i, {}])),
			30: Object.fromEntries(rooms.map(i => [i, {}])),
		}
	)

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
