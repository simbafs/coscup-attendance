import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useRouter } from 'next/router'

export function useQuery(key: string, initialValue: string) {
	const router = useRouter()
	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		if (router.isReady) {
			const queryValue = router.query[key]

			if (!queryValue) return
			if (Array.isArray(queryValue)) setValue(queryValue[0])
			else setValue(queryValue)
		}
	}, [router.isReady, router.query, key])

	const updateValue = useCallback(
		(value: string) => {
			router.push(
				{
					query: {
						...router.query,
						[key]: value,
					},
				},
				undefined,
				{ shallow: true },
			)
		},
		[key, router],
	)

	return [value, updateValue] as const
}

export function useQueryReducer<T, U>(
	key: string,
	reducer: (value: T, update: U) => T,
	initial: T,
	opt?: {
		decoder: (value: string) => T
		encoder: (value: T) => string
	},
) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	let decoder = opt?.decoder || ((value: string) => value as unknown as T)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	let encoder = opt?.encoder || ((value: T) => value as unknown as string)

	const [value, setValue] = useQuery(key, encoder(initial))

	const updateValue = useCallback(
		(update: U) => {
			setValue(encoder(reducer(decoder(value), update)))
		},
		[decoder, encoder, reducer, setValue, value],
	)

	return [decoder(value), updateValue] as const
}
