const fastify = require("fastify")();
const metrics = require('fastify-metrics');

fastify.register(metrics, { endpoint: '/metrics' });
fastify.register(require("./src/websockets/chatSocket.js"));

fastify.listen({ host: '0.0.0.0', port: 3000 }, (err, addr) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log('Routes :\n' + fastify.printRoutes());
	console.log(`Server listening at ${addr}`);
});
