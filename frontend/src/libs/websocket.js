const auth = require('./auth.js')

// let io
function setIO(ioParam) {
	global.io = ioParam
	console.log('setup websocket server')

	global.io.use((socket, next) => {
		if (!auth(socket.handshake.auth.token)) return next(new Error('unauthorized'))
		next()
	})

	global.io.on('connection', socket => {
		// your sockets here
		console.log('Client connected:', socket.id)

		// socket.on('message', (data) => {
		//     console.log('Received message:', data);
		//     // You can emit messages back to the clients here if needed
		// });
		//

		socket.on('connect_error', err => {
			console.log('connect error:', err)
		})

		socket.on('echo', data => {
			console.log('Received echo:', data)
			socket.emit(
				'echo',
				JSON.stringify({
					echo: data,
				}),
			)
		})

		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id)
		})
	})
}

function getIO() {
	return global.io
}

module.exports = {
	setIO,
	getIO,
}
