import configEnv from './configEnv.js';
import connectDB from './configMongoDb.js';
import RedisClient from '../redis/redis.js';

configEnv();

export default async function config() {
	await RedisClient.connect();
	await connectDB();
}