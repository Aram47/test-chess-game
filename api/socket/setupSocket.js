import { Server } from 'socket.io';
import { verifyToken } from '../../utility/verifyToken.js';

export default async function setupSocket(server) {
	const io = new Server(server, {
		cors: { origin: '*' },
	});

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token 
      	|| socket.handshake.headers['authorization']?.split(' ')[1];

    	const user = await verifyToken(token);

    	socket.user = user;
    	next();
		} catch (err) {
			next(new Error('Unauthorized'));
		}
	});

	io.on('connection', (socket) => {
		console.log('New client connected:', socket.id);
		
		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id);
		});

		// Additional socket event handlers can be added here
	});
}