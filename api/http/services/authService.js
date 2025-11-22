import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/user.js';

export default class AuthService {
	constructor() {}

	register = async (req, res) => {
		const { username, password } = req.body;

		const existingUser = await User.findOne({ username });

		if (existingUser) {
			return res.status(400).json({ error: 'Username already exists' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({ username, password: hashedPassword });
		await newUser.save();

		return newUser;
	}

	login = async (req, res) => {
		const { username, password } = req.body;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); // in development it's not exposed

		return { user, token };
	}
}