import { useCallback, useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'

export function useQueryReducer<T, U>(
	key: string,
	reducer: (value: T, update: U) => T,
	initial: T,
	opt?: {
		decoder: (value: string) => T
		encoder: (value: T) => string
	},
) {
	let decoder = opt?.decoder || ((value: string) => value as unknown as T)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	let encoder = opt?.encoder || ((value: T) => value as unknown as string)

	const router = useRouter()

	let oldData = router.query[key]
	if (!oldData) oldData = encoder(initial)
	else if (Array.isArray(oldData)) oldData = oldData[0]

	const setQuery = useCallback(
		(value: T) => {
			router.push(
				{
					query: {
						...router.query,
						[key]: encoder(value),
					},
				},
				undefined,
				{ shallow: true },
			)
		},
		[encoder, key, router],
	)

	useEffect(() => {
		if (!router.query[key]) {
			setQuery(initial)
		}
	}, [initial, key, router.query, setQuery])

	return useReducer((value: T, update: U) => {
		const next = reducer(value, update)
		router.push(
			{
				query: {
					...router.query,
					[key]: encoder(next),
				},
			},
			undefined,
			{ shallow: true },
		)
		return next
	}, decoder(oldData))
}
