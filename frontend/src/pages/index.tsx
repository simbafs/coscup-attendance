// hooks
import { useReducer, useEffect } from 'react'
import useSWR from 'swr'
import useWS from '@/hooks/useWS'
import { useRouter } from 'next/router'
import { useDay, useFloor } from '@/hooks/useParams'

// others
import box from '@/variants/box'
import { Diff, useDiff } from '@/hooks/useDiff'
import { Sessions, Session as TSession, getFloor } from '@/types/session'
import { Attendance } from '@/types/attendance'
import { twMerge } from 'tailwind-merge'
import { shouldParse } from '@/libs/util'

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

	// get initial attendance
	useEffect(() => {
		console.log({ token })
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

	// process the incoming message
	useEffect(() => {
		console.log({ lastMessage })
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
	const [day, Day] = useDay('29')
	const [floor, Floor] = useFloor('1F')

	const [appendDiff] = useDiff(updateAttendance)

	let groupedSessions = groupBy(
		data.sessions.filter(item => new Date(item.start).getDate() == Number(day)),
		s => getFloor(s.room) || '1F',
	)[floor]

	// sort by start time
	groupedSessions.sort((a, b) => {
		const timeA = new Date(a.start).getTime()
		const timeB = new Date(b.start).getTime()
		return timeA - timeB
	})

	return (
		<>
			<div className="text-center my-4">
				<Day />
				的
				<Floor />
			</div>
			<hr className="my-4" />

			<div className="grid grid-cols-[minmax(100px,1fr)_1fr_3fr] md:grid-cols-6 mx-4 gap-2 md:mx-20">
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

function groupBy<T extends Record<string, any>>(arr: T[], fn: (item: T, index: number) => string): Record<string, T[]> {
	let result: Record<string, T[]> = {}
	arr.forEach((item, index) => {
		const key = fn(item, index)
		if (!result[key]) {
			result[key] = []
		}
		result[key].push(item)
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
				{getFormatedDate(session.start)} - {getFormatedDate(session.end)}
			</div>
			<div className="my-auto">{session.room}</div>
			<input
				type="number"
				value={attendance}
				min={0}
				onChange={e => setAttendance(Number(e.target.value))}
				className={twMerge(box(), 'min-w-0')}
				disabled={!connected}
			/>
			<div className="col-span-3">
				<span className="text-right break-words font-bold">{session.zh.title}</span>
			</div>
			<div className="col-span-3 md:col-span-6 border-t border-gray-400 my-2" />
		</>
	)
}
