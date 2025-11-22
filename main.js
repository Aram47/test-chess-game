import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import gameRouter from './routes/gameRoute.js';

dotenv.config({
	path: `.env.${process.env.NODE_ENV}`,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/game', gameRouter);

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server is running on port ${PORT}`);
});
