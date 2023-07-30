// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

let data = await fetch('https://coscup.org/2023/json/session.json')
	.then(res => res.json())
	.then(data => {
		let rooms = Array.from(new Set(data.sessions.map(i => i.room)))

		const dayOfSession = s => new Date(s.start).getDate()
		const fn = (day, room) =>
			data.sessions
				.filter(s => s.room == room && dayOfSession(s) == day)
				.map(s => [s.id, 0])

		return {
			29: Object.fromEntries(
				rooms.map(i => [i, Object.fromEntries(fn(29, i))])
			),
			30: Object.fromEntries(
				rooms.map(i => [i, Object.fromEntries(fn(30, i))])
			),
		}
	})

// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
export default function handler(req, res) {
	if (req.method == 'GET') {
		return res.status(200).json(data)
	}

	try {
		const diff = JSON.parse(req.body)
		if (!Array.isArray(diff)) {
			throw new Error('body should be an array')
		}
		diff.forEach(update => {
			if (
				!('day' in update) ||
				!('room' in update) ||
				!('id' in update) ||
				!('attendance' in update)
			) {
				throw new Error('missing field')
			}

			if (update.day != 29 && update.day != 30) {
				throw new Error('day should be 29 or 30')
			}

			data[update.day][update.room][update.id] = update.attendance
		})
	} catch (e) {
		return res.status(400).json({
			status: 'error',
			message: e.message,
		})
	}

	res.status(200).json({
		status: 'ok',
	})
}
