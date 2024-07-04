export function groupBy<T extends Record<string, any>>(
  arr: T[],
  fn: (item: T, index: number) => string,
): Record<string, T[]> {
  let result: Record<string, T[]> = {}
  arr.forEach((item, index) => {
    const key = fn(item, index)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  })
  return result
}

export function getFormatedDate(dateStr: string) {
  let time = new Date(dateStr)
  let to2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  return `${to2(time.getHours())}:${to2(time.getMinutes())}`
}

export function shouldParse<T>(text: string | null, fallback: T): T {
  if (!text) return fallback
  let data: T
  try {
    data = JSON.parse(text) as T
  } catch (e) {
    data = fallback
  }

  return data
}
