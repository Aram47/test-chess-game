import configEnv from './configEnv.js';
import RedisClient from '../redis/redis.js';
// import connectDB from './configMongoDb.js';

export default async function config() {
	configEnv();
	await RedisClient.connect();
	// await connectDB();
}