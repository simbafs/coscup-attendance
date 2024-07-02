export default function shouldParse<T>(text: string | null, fallback: T): T {
	if (!text) return fallback
	let data: T
	try {
		data = JSON.parse(text) as T
	} catch (e) {
		data = fallback
	}

	return data
}
