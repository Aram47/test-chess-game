import { createClient } from 'redis';

const redisClient = await (async () => {
	const client = createClient({
  		url: process.env.REDIS_URI,
	});

	client.on("error", (err) => console.error("Redis Error:", err));
	client.on("connect", () => console.log("Connected to Redis"));
	client.on("ready", () => console.log("Redis Client Ready"));
	client.on("end", () => console.log("Redis Connection Closed"));
	client.on("reconnecting", () => console.log("Reconnecting to Redis"));
	client.on("warning", (warning) => console.warn("Redis Warning:", warning));
	client.on("idle", () => console.log("Redis Client Idle"));
	client.on("offline", () => console.log("Redis Client Offline"));

	await client.connect();

	return client;
})();

export default redisClient;