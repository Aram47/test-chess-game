export default class GameController {
	constructor(gameService) {
		this.gameService = gameService;
	}

	createGame = async (req, res) => {
		return await this.gameService.createGame(req, res);
	}

	movePiece = async (req, res) => {
		return await this.gameService.movePiece(req, res);
	}

	endGame = async (req, res) => {
		return await this.gameService.endGame(req, res);
	}

	getGameState = async (req, res) => {
		return await this.gameService.getGameState(req, res);
	}
};