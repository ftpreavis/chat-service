const fastify = require("fastify")();
const metrics = require('fastify-metrics');

fastify.register(require('@fastify/websocket'));
fastify.register(metrics, { endpoint: '/metrics' });

fastify.register(async function (fastify) {
	fastify.get('/chat', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
		socket.on('message', message => {
			// message.toString() === 'hi from client'
			socket.send(message.toString());
		})
	})
})

// fastify.get('/chat', { websocket: true }, (connection /* WebSocket */, req) => {
// 	console.log('New connection');
// 	console.log(connection.socket instanceof WebSocket);
// 	connection.socket.on("message", (msg) => {
// 		console.log('Message received:', msg);
// 		connection.socket.send(msg);
// 	});
// });

fastify.listen({ host: '0.0.0.0', port: 3000}, (err, addr) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${addr}`)
})
