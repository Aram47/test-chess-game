import configEnv from './configEnv.js';
// import connectDB from './mongoDb.js';

export default async function config() {
	configEnv();
	// await connectDB();
}