export default class AuthController {
	constructor(authService) {
		this.authService = authService;
	}

	register = async (req, res) => {
		try {
			const user = await this.authService.register(req, res);
			return res.status(201).json({ message: 'User registered successfully', user });
		} catch (error) {
			console.error('Error in register controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	login = async (req, res) => {
		try {
			const user = await this.authService.login(req, res);
			return res.status(200).json({ message: 'User logged in successfully', user });
		} catch (error) {
			console.error('Error in login controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	logout = async (req, res) => {
		try {
			return await this.authService.logout(req, res);
		} catch (error) {
			console.error('Error in logout controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

}