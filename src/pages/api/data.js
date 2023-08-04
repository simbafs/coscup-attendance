import NewDB from "@/libs/db"

const db = await NewDB('./data/data.json')

export default function handler(req, res) {
	const data = db.getJSON()
	return res.status(200).json(data)
}
