import { useQueryReducer } from './useQuery'
import { floors, days, Day, Floor } from '@/types/session'
import box from '@/variants/box'

export function useDay(defaultDay: Day) {
	const [day, setDay] = useQueryReducer<Day, string>(
		'day',
		(oldDay, newDay) => {
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
	invalid?: boolean
}

export function useTime(defaultTime: Time) {
	const [time, setTime] = useQueryReducer<Time, string>(
		'time',
		(oldTime, newTime) => {
			const [hour, minute] = newTime.split(':').map(Number)
			if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
				return oldTime
			}
			return {
				hour,
				minute,
				invalid: newTime === '',
			}
		},
		defaultTime,
		{
			encoder: time => `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`,
			decoder: str => {
				const [hour, minute] = str.split(':').map(Number)
				return {
					hour,
					minute,
				}
			},
		},
	)

	return [
		time,
		() => (
			<input
				type="time"
				value={`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`}
				onChange={e => setTime(e.target.value)}
				className={box()}
			/>
		),
	] as const
}
