import NewDB from '@/libs/db'

const file = './data/data.json'
const db = await NewDB(file, diff => {
	console.log('db updated', diff)
})

// update = {day: 29, room: 'AU', id: 'V8F9VH', attendance: 10}
export default async function handler(req, res) {
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
