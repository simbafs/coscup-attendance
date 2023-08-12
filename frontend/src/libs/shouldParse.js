/**
 * JSON.parse, but if error, return fallback
 * @template T
 * @param {string} text
 * @param {T} fallback
 * @return {T}
 */
export default function shouldParse(text, fallback) {
	let data
	try {
		data = JSON.parse(text)
	} catch (e) {
		data = fallback
	}

	return data
}
