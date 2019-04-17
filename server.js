const express = require('express')
const app = express()
let server = require('http').createServer(app);
const config = { pingTimeout: 60000 };
let io = require('socket.io').listen(server, config);
let sockets = new Set();
const path = require('path')
let cors = require('cors')
let index = require('./server/routes/index')
let users = require('./server/routes/users')
let profile = require('./server/routes/profile')
let chat = require('./server/routes/chat')
let auth = require('./server/routes/auth')
let sendmail = require('./server/routes/sendmail')
let upload = require('./server/routes/upload')
let messages = require('./server/routes/messages')
let interests = require('./server/routes/interests')
let match = require('./server/routes/match')
let tags = require('./server/routes/tags')
let geolocation = require('./server/routes/geolocation')
let suggestions = require('./server/routes/suggestions')
let notifications = require('./server/routes/notifications')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let pool = require('./server/db_connection')
let {addLike, addVisit, unLike, Block, IsOnline, IsOffline } = require('./server/controllers/actionProfile')
let { InsertMessage } = require('./server/controllers/actionMessages')
let { InsertNotification } = require('./server/controllers/actionNotifications')
app.use(cors({ credentials: true, origin: 'http://localhost:4200' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/', index)
app.use('/profile', profile)
app.use('/geolocation', geolocation)
app.use('/users', users)
app.use('/auth', auth)
app.use('/sendmail', sendmail)
app.use('/tags', tags)
app.use('/upload', upload)
app.use('/chat', chat)
app.use('/interests', interests)
app.use('/match', match)
app.use('/messages', messages)
app.use('/suggestions', suggestions)
app.use('/notifications', notifications)
app.use('/', express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
	let err = new Error('Not Found')
	err.status = 200;
	next(err)
})

app.use('*', express.static(path.join(__dirname, 'dist')))

io.on('connection', (socket) => {
	socket.on('authenticate', async (data) => {
		socket.id_user = data.id;
		const AuthError = await IsOnline(socket.id_user);
		if (AuthError !== null && AuthError !== undefined) {
			console.log(AuthError)
		}

	})

	socket.on('disconnect', () => {
	});

	socket.on('message', async (data) => {

		const MessageError = await InsertMessage(data.sender, data.receiver, data.id_chatroom, data.content)
		if (MessageError !== null && MessageError !== undefined) {
			console.log(MessageError)
		} else {
			// const NotificationError = await InsertNotification(data.sender, data.receiver, 'message', 0)
			// if (NotificationError !== null && NotificationError !== undefined  ) {
			//   console.log(NotificationError)
			// }
			// else {
			for (let index in io.sockets.connected) {
				let conn = io.sockets.connected[index]
				if (conn.id_user === data.receiver) {
					io.sockets.to(index).emit('message', data)
				}
				if (conn.id_user === data.sender) {
					io.sockets.to(index).emit('message', data)
				}
			}
			// }
		}
	});

	socket.on('visit', async (data) => {
		if (data && data.id_user == data.id_visited) return;

		const VisitError = await addVisit(data.id_user, data.id_visited);
		if (VisitError !== null && VisitError !== undefined) {
		} else {
			const NotificationError = await InsertNotification(data.id_user, data.id_visited, 'visit', 0)
			if (NotificationError !== null && NotificationError !== undefined) {
			} else {
				for (let index in io.sockets.connected) {
					let conn = io.sockets.connected[index]
					if (conn.id_user === parseInt(data.id_visited)) {
						io.sockets.to(index).emit('visit', data)
					}
					if (conn.id_user === data.id_user) {
						io.sockets.to(index).emit('visit', data)
					}
				}
			}
		}
	});


	socket.on('like', async (data) => {
		if (data && data.id_visited == data.id_visitor) return;
		await addLike(data);
		if (data.error) {
		} else {
			const NotificationError = await InsertNotification(data.id_visitor, data.id_visited, 'like', 0)
			if (NotificationError !== null && NotificationError !== undefined && NotificationError !== "blocked") {
			} else {
				for (let index in io.sockets.connected) {
					let conn = io.sockets.connected[index]
					if (conn.id_user === data.id_visited) {
						if (NotificationError != "blocked")
							io.sockets.to(index).emit('like', data)
					}
					if (conn.id_user === data.id_visitor) {
						io.sockets.to(index).emit('like', data)
					}
				}
				if (data.match == 1) {
					const NotificationError = await InsertNotification(data.id_visitor, data.id_visited, 'match', 0)
					if (NotificationError !== null && NotificationError !== undefined) {
					} else {
						for (let index in io.sockets.connected) {

							let conn = io.sockets.connected[index]
							if (conn.id_user === data.id_visited) {
								io.sockets.to(index).emit('match', data)
							}
							if (conn.id_user === data.visitor) {
								io.sockets.to(index).emit('match', data)
							}
						}
					}
				}
			}
		}
	});

	socket.on('unlike', async (data) => {
		if (data && data.id_visited == data.id_visitor) return;

		await unLike(data);
		if (data.error) {
		} else {
			for (let index in io.sockets.connected) {
				let conn = io.sockets.connected[index]
				if (data.unmatch == 1) {
					if (conn.id_user === data.id_visited) {
						io.sockets.to(index).emit('unlike', data)
					}
				}
				if (conn.id_user === data.id_visitor) {
					io.sockets.to(index).emit('unlike', data)
				}
			}
			if (data.unmatch == 1) {
				const NotificationError = await InsertNotification(data.id_visitor, data.id_visited, 'unmatch', 0)
				if (NotificationError !== null && NotificationError !== undefined) {
				} else {
					for (let index in io.sockets.connected) {

						let conn = io.sockets.connected[index]
						if (conn.id_user === data.id_visited) {
							io.sockets.to(index).emit('unmatch', data)
						}
						if (conn.id_user === data.id_visitor) {
							io.sockets.to(index).emit('unmatch', data)
						}
					}
				}
			}
		}
	})

	socket.on('block', async (data) => {
		if (data && data.id_visited == data.id_visitor) return;

		await Block(data);
		if (data.error) {
		} else {
			for (let index in io.sockets.connected) {
				let conn = io.sockets.connected[index]
				if (conn.id_user === data.id_visited) {
					io.sockets.to(index).emit('block', data)
				}
				if (conn.id_user === data.id_visitor) {
					io.sockets.to(index).emit('block', data)
				}
			}
			if (data.unmatch == 1) {
				for (let index in io.sockets.connected) {
					let conn = io.sockets.connected[index]
					if (conn.id_user === data.id_visited) {
						io.sockets.to(index).emit('unmatch', data)
					}
					if (conn.id_user === data.id_visitor) {
						io.sockets.to(index).emit('unmatch', data)
					}
				}
			}
		}
	})
})


const port = process.env.PORT || 3000 // PORT is another variable that can be placed in the .env file --> see docs on --> docenv
server.listen(process.env.PORT || 3000, function() {
	console.log('Matcha listening on port ' + port + '!')
})

module.exports = app
