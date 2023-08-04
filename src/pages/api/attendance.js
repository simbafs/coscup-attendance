import NewDB from '@/libs/db'

const file = './data/data.json'
const db = await NewDB(file, diff => {
	console.log('db updated', diff)
})

// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
export default function handler(req, res) {
	if (req.method == 'GET') {
		return res.status(200).json(db.getJSON().attendance)
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

			const err = db.appendDiff(update)
			if (err) {
				throw err
			}
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
