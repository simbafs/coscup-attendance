export default async function getDefaultAttendance() {
	return await fetch('https://coscup.org/2023/json/session.json')
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
}
