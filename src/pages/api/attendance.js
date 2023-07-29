// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

let data = {}

export default function handler(req, res) {
	data = req.body
	res.status(200).json({ status: 'ok' })
}
