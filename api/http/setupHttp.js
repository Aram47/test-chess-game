import cors from 'cors';
import express from 'express';
import authRouter from './routes/authRoute.js';
import gameRouter from './routes/gameRoute.js';

export default function setupHttp() {
	const app = express();

	app.use(express.json());
	app.use(cors({ origin: '*' }));
	app.use('/auth', authRouter);
	app.use('/game', gameRouter);

	return app;
}