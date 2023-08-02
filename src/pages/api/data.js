import fs from 'fs'

export default function handler(req, res) {
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'))
        res.status(200).json(data)
    } catch (e) {
        res.status(400).json({
            status: 'error',
            error: e,
        })
    }
}
