import { useState, useEffect } from 'react'

/**
 * hook for websocket
 * @param {string} path
 * @param {object} opt
 * @param {boolean} opt.reconnect
 * @param {number} opt.reconnectInterval -- in ms
 * @returns {{
 *  socket: WebSocket,
 *  lastMessage: string,
 *  error: Error,
 * }}
 *
 */
export default function useWS(
	path,
	opt = { reconnect: true, reconnectInterval: 500 }
) {
	// output
	const [socket, setSocket] = useState(null)
	const [lastMessage, setLastMessage] = useState(null)
	const [error, setError] = useState(null)

	// status
	const isBrowser = typeof window !== 'undefined'
	const [hasConnected, setHasConnected] = useState(false)

	// tritter
	const [triggerReconnect, setTriggerReconnect] = useState(0)

	const connect = path => {
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
	}, [
		isBrowser,
		path,
		socket,
		hasConnected,
		opt.reconnect,
		opt.reconnectInterval,
		triggerReconnect,
	])

	useEffect(() => {
		if (!socket) return

		const handleOpen = () => console.log(`connected to ${path}`)
		const handleClose = () => {
			console.log(`disconnected from ${path}`)
			setSocket(null)
		}
		const handleMessage = event => setLastMessage(event.data)
		const handleError = event => {
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
	}, [socket])

	return {
		socket,
		lastMessage,
		error,
	}
}
