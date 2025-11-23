import { createClient } from 'redis';

export default class RedisClient {
	static connect = async () => {
		if (!RedisClient.client) {
			RedisClient.client = createClient({
				url: process.env.REDIS_URI,
			});

			RedisClient.client.on("error", (err) => console.error("Redis Error:", err));
			RedisClient.client.on("connect", () => console.log("Connected to Redis"));
			RedisClient.client.on("ready", () => console.log("Redis Client Ready"));
			RedisClient.client.on("end", () => console.log("Redis Connection Closed"));
			RedisClient.client.on("reconnecting", () => console.log("Reconnecting to Redis"));
			RedisClient.client.on("warning", (warning) => console.warn("Redis Warning:", warning));
			RedisClient.client.on("idle", () => console.log("Redis Client Idle"));
			RedisClient.client.on("offline", () => console.log("Redis Client Offline"));

			await RedisClient.client.connect();
		}
	}
	
	static getClient = async () => {
		if (!RedisClient.client) {
			await RedisClient.connect();
		}
		return RedisClient.client;
	}
}