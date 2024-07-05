import useLocalStorageReducer from '@/hooks/useLocalStorageReducer'
import { floors, days, Day, Floor } from '@/types/session'
import box from '@/variants/box'

export function useDay(defaultDay: Day) {
	const [day, setDay] = useLocalStorageReducer<string, string>(
		'day',
		(oldDay, newDay) => {
			if (Object.keys(days).includes(newDay)) {
				return newDay
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

// export function useRoom(rooms: string[], defaultRoom: string) {
// 	const [room, setRoom] = useLocalStorageReducer<string, string>(
// 		'room',
// 		(oldRoom, newRoom) => {
// 			if (rooms.includes(newRoom)) {
// 				return newRoom
// 			}
// 			return oldRoom
// 		},
// 		defaultRoom,
// 	)
//
// 	return [room, setRoom] as const
// }

export function useFloor(defaultFloor: Floor) {
	const [floor, setFloor] = useLocalStorageReducer<Floor, string>(
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
