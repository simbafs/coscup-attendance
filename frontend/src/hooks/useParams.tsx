import { useQueryReducer } from './useQuery'
import { floors, days, Day, Floor } from '@/types/session'
import box from '@/variants/box'

export const empty = 'EMPTY'

export function useDay(defaultDay: Day) {
	const [day, setDay] = useQueryReducer<Day, string>(
		'day',
		(oldDay, newDay) => {
			if (newDay === empty) return empty
			if (Object.keys(days).includes(newDay)) {
				return newDay as Day
			}
			return oldDay
		},
		defaultDay,
	)

	return [
		day,
		() => (
			<select value={day} onChange={e => setDay(e.target.value)} className={box()}>
				<option value={empty}>Select a day</option>
				{Object.entries(days).map(([key, value]) => (
					<option key={key} value={key}>
						{value}
					</option>
				))}
			</select>
		),
	] as const
}

export function useFloor(defaultFloor: Floor) {
	const [floor, setFloor] = useQueryReducer<Floor, string>(
		'floor',
		(oldFloor, newFloor) => {
			if (newFloor === empty) return empty
			if (newFloor in floors) {
				return newFloor as Floor
			}
			return oldFloor
		},
		defaultFloor,
	)

	return [
		floor,
		() => (
			<select value={floor} onChange={e => setFloor(e.target.value)} className={box()}>
				<option value={empty}>Select a floor</option>
				{Object.keys(floors).map(floor => (
					<option key={floor} value={floor}>
						{floor}
					</option>
				))}
			</select>
		),
	] as const
}

export type Time = {
	hour: number
	minute: number
	empty: boolean
}

export function useTime(defaultTime: Time) {
	const [time, setTime] = useQueryReducer<Time, string>(
		'time',
		(oldTime, newTime) => {
			if (newTime === empty)
				return {
					hour: 0,
					minute: 0,
					empty: true,
				}
			const [hour, minute] = newTime.split(':').map(Number)
			if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
				return oldTime
			}
			return {
				hour,
				minute,
				empty: false,
			}
		},
		defaultTime,
		{
			encoder: time =>
				time.empty ? empty : `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`,
			decoder: str => {
				if (str === empty) {
					return {
						hour: 0,
						minute: 0,
						empty: true,
					}
				}
				const [hour, minute] = str.split(':').map(Number)
				return {
					hour,
					minute,
					empty: false,
				}
			},
		},
	)

	const clear = () => setTime(empty)

	return [
		time,
		() => (
			<>
				<input
					type="time"
					value={`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`}
					onChange={e => setTime(e.target.value)}
					className={box()}
				/>
				<button onClick={clear} className={box()}>
					Clear
				</button>
			</>
		),
	] as const
}
