import { useReducer } from "react";
import shouldParse from "./shouldParse";

/**
 * useReducer but has localstorage
 * @param {string} key
 * @param {(value: T, update: V) => T} reducer
 * @param {T} initial
 * @return {[T, (update: V) => void]}
 * @template T
 */
export default function useLocalStorageReducer(key, reducer, initial) {
    const oldData = localStorage.getItem(key)
    const data = oldData ? shouldParse(oldData, initial) : initial
    localStorage.setItem(key, JSON.stringify(data))
    const [value, updateValue] = useReducer((value, update) => {
        const next = reducer(value, update)
        localStorage.setItem(key, JSON.stringify(next))
        return next
    }, data)
    return [value, updateValue]
}
