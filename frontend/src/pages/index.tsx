// hooks
import { useReducer, useEffect } from 'react'
import useSWR from 'swr'
import useWS from '@/hooks/useWS'
import { useRouter } from 'next/router'
import { useDay, useRoom } from '@/hooks/useParams'

// others
import box from '@/variants/box'
import shouldParse from '../libs/shouldParse'
import { Diff, useDiff } from '@/hooks/useDiff'
import { Sessions, Session as TSession } from '@/types/session'
import { Attendance } from '@/types/attendance'
import { twMerge } from 'tailwind-merge'

export default function Home() {
	const token = useRouter().query.token as string

	const { socket, lastMessage } = useWS('ws://localhost:3000/ws')
	const { data, error } = useSWR<Sessions>(`/session.json`, url => fetch(url).then(res => res.json()))
	const [attendance, updateAttendance] = useReducer(
		(
			state: Attendance,
			action: {
				data: Attendance
				overwrite: boolean
			},
		) => {
			if (action.overwrite) {
				return action.data
			}
			if (!state) return state

			const r = { ...state, ...action.data }
			// r[action.id] = Number(action.attendance)
			return r
		},
		{},
	)

	useEffect(() => {
		console.log({ lastMessage })
	}, [lastMessage])

	// init attendance
	useEffect(() => {
		console.log('fetching attendance')
		fetch(`/api/attendance?token=${token}`)
			.then(res => res.json())
			.then(data => {
				console.log('!!!', data)
				return data
			})
			.then(data =>
				updateAttendance({
					data: data.attendance,
					overwrite: true,
				}),
			)
			.then(() => console.log('attendance loaded'))
	}, [token])

	useEffect(() => console.log({ token }), [token])

	useEffect(() => {
		const dataArray = shouldParse<Diff[]>(lastMessage, [])

		let update: Record<string, number> = {}
		for (let data of dataArray) {
			update[data.id] = data.attendance
		}

		updateAttendance({
			data: update,
			overwrite: false,
		})
	}, [lastMessage])

	return (
		<>
			{socket ? (
				<p className="text-green-500" key="connect">
					Connected
				</p>
			) : (
				<p className="text-red-500" key="disconnect">
					Disconnected
				</p>
			)}
			{error ? (
				<div>
					<h1>Fail to laod data:</h1>
					<pre>{JSON.stringify(error, null, 2)}</pre>
				</div>
			) : data && attendance ? (
				<Table data={data} attendance={attendance} updateAttendance={updateAttendance} connected={!!socket} />
			) : (
				<div className="text-center my-4">Loading...</div>
			)}
		</>
	)
}

function Table({
	data,
	attendance,
	updateAttendance,
	connected,
}: {
	data: Sessions
	attendance: Attendance
	updateAttendance: React.Dispatch<{
		data: Attendance
		overwrite: boolean
	}>
	connected: boolean
}) {
	const rooms = data.rooms.map(r => r.id)

	const [day, setDay] = useDay(['29', '30'], '29')
	const [room, setRoom] = useRoom(rooms, 'AU')

	const [appendDiff] = useDiff(updateAttendance)

	// init day and room
	// useEffect(() => {
	// 	if (!localStorage) return
	//
	// 	let day = localStorage.getItem('day')
	// 	let room = localStorage.getItem('room')
	//
	// 	if (day) {
	// 		setDay(day)
	// 	}
	// 	if (room) {
	// 		setRoom(room)
	// 	}
	// }, [setDay, setRoom])

	let groupedSessions = groupBy(
		data.sessions.filter(item => new Date(item.start).getDate() == Number(day)),
		'room',
	)[room]

	// sort by start time
	groupedSessions.sort((a, b) => {
		const timeA = new Date(a.start).getTime()
		const timeB = new Date(b.start).getTime()
		return timeA - timeB
	})

	return (
		<>
			<div className="text-center my-4">
				<select value={day} onChange={e => setDay(e.target.value)} className={box()}>
					<option value={29}>7/29</option>
					<option value={30}>7/30</option>
				</select>
				的
				<select value={room} onChange={e => setRoom(e.target.value)} className={box()}>
					{rooms.map(room => (
						<option key={room} value={room}>
							{room}
						</option>
					))}
				</select>
				廳
			</div>
			<hr className="my-4" />

			<div className="grid grid-cols-[minmax(100px,1fr)_3fr] md:grid-cols-4 mx-4 gap-2 md:mx-20">
				{groupedSessions.map(s => (
					<Session
						key={s.id}
						session={s}
						attendance={attendance[s.id]}
						setAttendance={n =>
							appendDiff({
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

function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> {
	let result: Record<string, T[]> = {}
	arr.forEach(item => {
		let value = String(item[key]) // Ensure the key is treated as a string
		if (!result[value]) {
			result[value] = []
		}
		result[value].push(item)
	})
	return result
}

function getFormatedDate(dateStr: string) {
	let time = new Date(dateStr)
	let to2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)

	return `${to2(time.getHours())}:${to2(time.getMinutes())}`
}

function Session({
	session,
	attendance,
	setAttendance,
	connected,
}: {
	session: TSession
	attendance: number
	setAttendance: (n: number) => void
	connected: boolean
}) {
	return (
		<>
			<div className="my-auto">
				<span>
					{getFormatedDate(session.start)} - {getFormatedDate(session.end)}
				</span>
			</div>
			<input
				type="number"
				value={attendance}
				min={0}
				onChange={e => setAttendance(Number(e.target.value))}
				className={twMerge(box(), 'min-w-0')}
				disabled={!connected}
			/>
			<div className="col-span-2">
				<span className="text-right break-words font-bold">{session.zh.title}</span>
			</div>
			<div className="col-span-2 md:col-span-4 border-t border-gray-400 my-2" />
		</>
	)
}
