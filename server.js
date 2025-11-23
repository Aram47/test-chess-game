import http from 'http';
import './config/config.js';
import setupHttp from './api/http/setupHttp.js';
import setupSocket from './api/socket/setupSocket.js';

class ChessServer {
	setup = async () => {
		const app = setupHttp();

		this.server = http.createServer(app);

		await setupSocket(this.server);

		return this;
	}

	listen = () => {
		const PORT = process.env.PORT;
		this.server.listen(PORT, '0.0.0.0' , () => {
			console.log(`Server is running on port ${PORT}`);
		});
	}
};

const server = new ChessServer();

export default server;