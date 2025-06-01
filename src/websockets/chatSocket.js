const { Server } = require('socket.io');
const axios = require('axios');
const fp = require('fastify-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = fp(async function (fastify, opts) {
	fastify.addHook('onReady', async () => {
		const io = new Server(fastify.server, {
			cors: {
				origin: isProd ? 'https://transcendance.charles-poulain.ovh' : '*',
				methods: ['GET', 'POST'],
			},
			path: '/socket/chat',
		});

		const users = new Map();

		io.on('connection', (socket) => {
			const userId = parseInt(socket.handshake.auth.userId);
			if (!userId || isNaN(userId)) {
				console.error('chatSocket: Invalid userId in auth');
				return socket.disconnect();
			}

			users.set(userId, socket.id);
			socket.join(`user:${userId}`);
			console.log(`chatSocket: User ${userId} connected`);

			socket.on('send_message', async ({ toUserId, content }) => {
				try {
					const { data:message } = await axios.post('http://db-service:3000/chat/messages', {
						senderId: userId,
						receiverId: toUserId,
						content,
					});

					const targetSocketId = users.get(toUserId);
					if (targetSocketId) {
						io.to(targetSocketId).emit('receive_message', message);
						io.to(targetSocketId).emit('notify_popup', {
							fromUserId: userId,
							content: message.content,
						});
					}
				} catch (err) {
					console.error('chatSocket: Failed to send message:', err.message);
					socket.emit('error', 'Failed to send message');
				}
			});

			socket.on('mark_as_read', async ({ withUserId }) => {
				try {
					await axios.patch('http://db-service:3000/chat/messages/read', {
						userId,
						withUserId,
					});
				} catch (err) {
					console.error('chatSocket: Failed to mark as read:', err.message);
				}
			});

			socket.on('disconnect', () => {
				users.delete(userId);
				console.log(`chatSocket: User ${userId} disconnected`);
			});
		});
	});
});
