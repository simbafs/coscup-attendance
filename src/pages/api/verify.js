import auth from "@/libs/auth";
export default function Handler(req, res) {
    if (auth(req.query.token)) {
        res.status(200).json({
            status: "ok",
        })
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Unauthorized'
        })
    }
}
