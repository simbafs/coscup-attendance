import auth from "@/libs/auth"
import NewDB from "@/libs/db"

const db = await NewDB('./data/data.json')

export default function handler(req, res) {
	if (!auth(req.query.token)) return res.status(401).json({
		status: 'error',
		message: 'Unauthorized'
	})

	const data = db.getJSON()
	return res.status(200).json(data)
}
