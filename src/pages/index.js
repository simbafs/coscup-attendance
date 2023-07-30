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
			<div className="container">
				<h1 className="text-center text-2xl font-semibold">
					製播組統計議程人數統計
				</h1>
				<div className="text-center my-4">
					<select
						value={day}
						onChange={(e) => setDay(e.target.value)}
						className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1 mx-4"
					>
						<option value={29}>7/29</option>
						<option value={30}>7/30</option>
					</select>
					的
					<select
						value={room}
						onChange={(e) => setRoom(e.target.value)}
						className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1 mx-4"
					>
						{rooms.map((room) => (
							<option key={room} value={room}>
								{room}
							</option>
						))}
					</select>
					廳
				</div>
				<hr className="my-4" />

				{sessions.map((s) => (
					<Session
						key={s.id}
						session={s}
						attendance={attendance[day][s.room][s.id]}
						setAttendance={(n) =>
							updateAttendance({
								day: day,
								room: s.room,
								id: s.id,
								attendance: n,
							})
						}
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

function Session({ session, attendance, setAttendance }) {
	return (
		<>
			<div className="w-full flex my-4 flex-nowrap">
				<span className="w-[100px] py-2 text-right">
					{getFormatedDate(session.start)}-{getFormatedDate(session.end)}
				</span>
				<input
					type="number"
					value={attendance}
					onChange={(e) => setAttendance(e.target.value)}
					className="w-16 mx-6 mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
				/>
				<span className="py-2 max-w-lg"> {session.zh.title}</span>
			</div>
		</>
	);
}
