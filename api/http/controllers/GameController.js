export default class GameController {
	constructor(gameService) {
		this.gameService = gameService;
	}

	createGame = async (req, res) => {
		try {
			const createdGameId = await this.gameService.createGame(req, res);
			return res.status(201).json({
				gameId: createdGameId,
				message: 'Game created successfully',
			});
		} catch (error) {
			console.error('Error in createGame controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	movePiece = async (req, res) => {
		try {
			return await this.gameService.movePiece(req, res);
		} catch (error) {
			console.error('Error in movePiece controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	endGame = async (req, res) => {
		try {
			return await this.gameService.endGame(req, res);
		} catch (error) {
			console.error('Error in endGame controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	getGameState = async (req, res) => {
		try {
			return await this.gameService.getGameState(req, res);
		} catch (error) {
			console.error('Error in getGameState controller:', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
};