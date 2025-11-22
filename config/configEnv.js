import dotenv from 'dotenv';

export default function configEnv() {
	dotenv.config({
		path: `.env.${process.env.NODE_ENV}`,
	});
}