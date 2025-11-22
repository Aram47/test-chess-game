import { verifyToken } from "../../../utility/verifyToken.js";

export default async function authenticateToken(req, res, next) {
	try {
		const token = req.headers['authorization']?.split(' ')[1];
		const user = await verifyToken(token);
		req.user = user; // Attach user info to request object
		next();
	} catch (err) {
		return res.status(403).json({ error: 'Invalid or expired token' });
	}
}