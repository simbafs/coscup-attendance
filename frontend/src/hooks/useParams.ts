import useLocalStorageReducer from '@/hooks/useLocalStorageReducer'

export function useDay(list: string[], defaultDay: string) {
	const [day, setDay] = useLocalStorageReducer<string, string>(
		'day',
		(oldDay, newDay) => {
			console.log({ list, newDay })
			if (list.includes(newDay)) {
				return newDay
			}
			return oldDay
		},
		defaultDay,
	)

	return [day, setDay] as const
}

export function useRoom(rooms: string[], defaultRoom: string) {
	const [room, setRoom] = useLocalStorageReducer<string, string>(
		'room',
		(oldRoom, newRoom) => {
			if (rooms.includes(newRoom)) {
				return newRoom
			}
			return oldRoom
		},
		defaultRoom,
	)

	return [room, setRoom] as const
}
