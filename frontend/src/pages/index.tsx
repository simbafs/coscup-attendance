// hooks
import { useEffect } from 'react'
import useSWRImmutable from 'swr/immutable'
import { empty, useDay, useFloor, useTime } from '@/hooks/useParams'

// others
import box from '@/variants/box'
import { useDiff } from '@/hooks/useDiff'
import { Sessions, Session as TSession, floors, getFloor, initFloors, initDays, days, formatDay } from '@/types/session'
import { Attendance } from '@/types/attendance'
import { twMerge } from 'tailwind-merge'
import { useToken } from '@/hooks/useToken'
import { useAttendance } from '@/hooks/useAttendance'

const f = Object.values(floors).reduce((acc, item) => acc.concat(item), [])

export default function Home() {
	const { data, error } = useSWRImmutable<Sessions>(`/session.json`, url =>
		fetch(url)
			.then(res => res.json())
			.then(data => {
				initFloors(data)
				initDays(data)
				console.log(floors, days)
				return data
			}),
	)
	const { isConnected, attendance, updateAttendance } = useAttendance()

	return (
		<>
			{isConnected ? (
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
				<Table
					data={data}
					attendance={attendance}
					updateAttendance={updateAttendance}
					connected={isConnected}
				/>
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
	const token = useToken()
	const [day, Day] = useDay(Object.keys(days)[0])
	const [floor, Floor] = useFloor(Object.keys(floors)[0])
	const [time, Time] = useTime({ hour: 10, minute: 0, empty: true })

	useEffect(() => console.log({ day, floor, time }), [day, floor, time])

	const appendDiff = useDiff(updateAttendance, token)

	// if parameter day is not empty, filter the sessions by day
	let groupedSessions = day === empty ? data.sessions : data.sessions.filter(item => formatDay(item.start) == day)

	// if parameter floor is not empty, filter the sessions
	if (floor !== empty) groupedSessions = groupBy(groupedSessions, s => getFloor(s.room) || '1F')[floor]

	if (!groupedSessions) groupedSessions = []

	groupedSessions.sort((a, b) => {
		const timeA = new Date(a.start).getTime()
		const timeB = new Date(b.start).getTime()
		return timeA - timeB
	})

	if (floor === empty) {
		groupedSessions.sort((a, b) => {
			// sorted by the room order defined in `floors`
			const idxA = f.indexOf(a.room)
			const idxB = f.indexOf(b.room)
			// console.log(floors[floor])
			// console.log(a.room, b.room, idxA, idxB)
			return idxA - idxB
		})
	} else {
		groupedSessions.sort((a, b) => {
			// sorted by the room order defined in `floors`
			const idxA = floors[floor].indexOf(a.room)
			const idxB = floors[floor].indexOf(b.room)
			// console.log(floors[floor])
			// console.log(a.room, b.room, idxA, idxB)
			return idxA - idxB
		})
	}

	// if parameter time is not valid, show all sessions
	if (!time.empty)
		groupedSessions = groupedSessions.filter(s => {
			const startHour = new Date(s.start).getHours()
			const startMinute = new Date(s.start).getMinutes()
			const endHour = new Date(s.end).getHours()
			const endMinute = new Date(s.end).getMinutes()
			return (
				(time.hour > startHour || (time.hour == startHour && time.minute >= startMinute)) &&
				(time.hour < endHour || (time.hour == endHour && time.minute <= endMinute))
			)
		})

	return (
		<>
			<div className="text-center my-4">
				日期
				<Day />
				樓層
				<Floor />
				時間
				<Time />
			</div>

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
