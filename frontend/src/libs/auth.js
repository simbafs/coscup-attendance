module.exports = function auth(providedToken) {
	const token = process.env.TOKEN
	if (providedToken === token) return true
	return false
}
