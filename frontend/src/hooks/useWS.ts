import { useState, useEffect } from 'react'

interface WebSocketOptions {
	reconnect: boolean
	reconnectInterval: number // in ms
}

interface WebSocketHook {
	socket: WebSocket | null
	lastMessage: string | null
	error: Event | null
}

export default function useWS(
	path: string,
	opt: WebSocketOptions = { reconnect: true, reconnectInterval: 500 },
): WebSocketHook {
	// output
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [lastMessage, setLastMessage] = useState<string | null>(null)
	const [error, setError] = useState<Event | null>(null)

	// status
	const isBrowser = typeof window !== 'undefined'
	const [hasConnected, setHasConnected] = useState(false)

	// trigger
	const [triggerReconnect, setTriggerReconnect] = useState(0)

	const connect = (path: string) => {
		const s = new WebSocket(path)
		console.log({ s })
		setSocket(s)
		setHasConnected(true)
	}

	useEffect(() => {
		if (!isBrowser) return
		if (socket) return
		// │ RC │   │
		// └──┐ │ T │ F
		//  HC│ │   │
		// ───┴─┼───┼────
		//    T │ C │ NC
		// ─────┼───┼────
		//    F │ C │ C
		//      │   │
		if (!opt.reconnect && hasConnected) return
		if (!hasConnected) {
			console.log('connecting')
			connect(path)
		} else {
			console.log('reconnecting')
			const timeout = setTimeout(() => {
				connect(path)
			}, opt.reconnectInterval)
			return () => clearTimeout(timeout)
		}
		console.log('trying to connect to', path)
	}, [isBrowser, path, socket, hasConnected, opt.reconnect, opt.reconnectInterval, triggerReconnect])

	useEffect(() => {
		if (!socket) return

		const handleOpen = () => console.log(`connected to ${path}`)
		const handleClose = () => {
			console.log(`disconnected from ${path}`)
			setSocket(null)
		}
		const handleMessage = (event: MessageEvent) => setLastMessage(event.data)
		const handleError = (event: Event) => {
			console.log('socket error', event)
			setTriggerReconnect(t => t + 1)
			setError(event)
		}

		socket.addEventListener('open', handleOpen)
		socket.addEventListener('close', handleClose)
		socket.addEventListener('message', handleMessage)
		socket.addEventListener('error', handleError)

		return () => {
			socket.removeEventListener('open', handleOpen)
			socket.removeEventListener('close', handleClose)
			socket.removeEventListener('message', handleMessage)
			socket.removeEventListener('error', handleError)
			socket.close()
			setSocket(null)
		}
	}, [socket, path])

	return {
		socket,
		lastMessage,
		error,
	}
}
