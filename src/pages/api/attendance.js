import auth from '@/libs/auth'
import NewDB from '@/libs/db'
import { getIO } from '@/libs/websocket'

const file = './data/data.json'
const db = await NewDB(file, diff => {
	getIO().emit('attendance', JSON.stringify(diff))
})

// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
export default async function handler(req, res) {
	if (!auth(req.query.token)) return res.status(401).json({
		status: 'error',
		message: 'Unauthorized'
	})

	if (req.method == 'GET') {
		return res.status(200).json(db.getJSON().attendance)
	}

	if (req.method == 'POST') {
		db.appendDiff(req.body)
			.then(() => res.status(200).json({
				status: 'ok',
			}))
			.catch(err => res.status(400).json({
				status: 'error',
				message: err.message
			}))
	}
}
