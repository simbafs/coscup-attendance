import Head from 'next/head'
import { useReducer, useState, useEffect } from 'react'
import { useDebounce } from 'usehooks-ts'
import useSWR from 'swr'

export default function Home() {
	const fetcher = url => fetch(url).then(res => res.json())
	const { data, error } = useSWR(
		'https://coscup.org/2023/json/session.json',
		fetcher
	)
	const { data: attendanceInit, error: error2 } = useSWR(
		'/api/attendance',
		fetcher
	)

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
				{(error || error2) && (
					<div>
						<h1>Fail to laod data:</h1>
						<pre>{JSON.stringify({ error, error2 }, null, 2)}</pre>
					</div>
				)}
				{!data ||
					(!attendanceInit && (
						<div className="text-center my-4">Loading...</div>
					))}
				{data && attendanceInit && (
					<Table data={data} attendanceInit={attendanceInit} />
				)}
			</div>
		</>
	)
}

function Table({ data, attendanceInit }) {
	const rooms = Array.from(new Set(data.sessions.map(i => i.room)))
	const [day, setDay] = useReducer((oldDay, newDay) => {
		if (newDay == 29 || newDay == 30) {
			localStorage.setItem('day', newDay)
			return newDay
		}
		return oldDay
	}, 29)
	const [room, setRoom] = useReducer((oldRoom, newRoom) => {
		if (rooms.includes(newRoom)) {
			localStorage.setItem('room', newRoom)
			return newRoom
		}

		localStorage.setItem('room', oldRoom)
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

	useEffect(() => {
		if (!localStorage) return

		let day = localStorage.getItem('day')
		let room = localStorage.getItem('room')

		console.log({ day, room })

		if (day) {
			setDay(day)
		}
		if (room) {
			setRoom(room)
		}
	}, [])

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
			<div className="text-center my-4">
				<select
					value={day}
					onChange={e => setDay(e.target.value)}
					className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1 mx-4"
				>
					<option value={29}>7/29</option>
					<option value={30}>7/30</option>
				</select>
				的
				<select
					value={room}
					onChange={e => setRoom(e.target.value)}
					className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1 mx-4"
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
				className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
			/>
			<div className="my-auto">
				<span className="text-right break-words">
					{session.zh.title}
				</span>
			</div>
		</>
	)
}
