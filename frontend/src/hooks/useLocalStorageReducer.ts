import { useReducer } from 'react'
import shouldParse from '../libs/shouldParse'

export default function useLocalStorageReducer<T, V>(
	key: string,
	reducer: (value: T, update: V) => T,
	initial: T,
): [T, (update: V) => void] {
	const oldData = localStorage.getItem(key)
	const data = oldData ? shouldParse(oldData, initial) : initial
	localStorage.setItem(key, JSON.stringify(data))
	const [value, updateValue] = useReducer((value: T, update: V) => {
		const next = reducer(value, update)
		localStorage.setItem(key, JSON.stringify(next))
		return next
	}, data)
	return [value, updateValue]
}
