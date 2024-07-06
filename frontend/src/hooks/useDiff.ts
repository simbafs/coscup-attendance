import { Attendance } from '@/types/attendance'
import { useState, useEffect, Dispatch } from 'react'
import { useDebounce } from 'usehooks-ts'

export type Diff = {
	id: string
	attendance: number
}

export function useDiff(
	updateAttendance: Dispatch<{
		data: Attendance
		overwrite: boolean
	}>,
	token: string,
) {
	const [diff, setDiff] = useState<Diff[]>([])
	const debuuncedDiff = useDebounce(diff, 300)

	useEffect(() => {
		if (debuuncedDiff.length == 0) return
		fetch(`/api/attendance?token=${token}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(debuuncedDiff),
		})
			.then(res => res.json())
			.then(console.log)
			.catch(console.error)
			.finally(() => setDiff([]))
		// .then(setAttendance)
	}, [debuuncedDiff])

	const appendDiff = (update: Diff) => {
		setDiff(diff =>
			diff.concat(update).reduce<Diff[]>((arr, item) => {
				const pre = arr.findIndex(i => i.id == item.id)
				if (pre >= 0) {
					arr[pre] = item
				} else {
					arr = arr.concat(item)
				}

				return arr
			}, []),
		)
		updateAttendance({
			data: {
				[update.id]: update.attendance,
			},
			overwrite: false,
		})
	}

	return [appendDiff] as const
}
