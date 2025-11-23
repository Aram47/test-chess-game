import { Chess } from 'chess.js';

export default class GameService {
	constructor(redisClient) {
		this.redisClient = redisClient;
	}

	createGame = async (req, res) => {
		const game = new Chess();

		const gameId = `game:${Date.now()}`; // Simple unique ID based on timestamp
		// game id will be changed to userId for storing all active games of user
		// seccond argument of hSet will be name of game or problem name
		await this.redisClient.hSet(`gameId: ${gameId} or userId`, 'problem name or ? th game (from req.body)', {
			fen: game.fen(),
			pgn: game.pgn(),
			turn: game.turn(),
			moves: JSON.stringify(game.moves()),
		});

		return gameId;
	}

	movePiece = async (req, res) => {
		const { gameId, from, to } = req.body;

		const gameData = await this.redisClient.hGetAll(`gameId: ${gameId} or userId`);
		if (!gameData || Object.keys(gameData).length === 0) {
			return res.status(404).json({ error: 'Game not found' });
		}

		const game = new Chess(gameData.fen);
		const move = game.move({ from, to });

		if (!move) {
			return res.status(400).json({ error: 'Invalid move' });
		}

		if (game.isGameOver()) {
			// Handle game over scenario
			// we can change this part to call shared function which will be used in endGame as well
			return await this.endGame(req, res);
		}
		// Update game state in Redis
		await this.redisClient.hSet(`gameId: ${gameId} or userId`, 'problem name or ? th game (from req.body)', {
			fen: game.fen(),
			pgn: game.pgn(),
			turn: game.turn(),
			moves: JSON.stringify(game.moves()),
		});

		return res.status(200).json({ message: 'Move made successfully', move });
	}

	endGame = async (req, res) => {
		const { gameId } = req.body;

		const gameData = await this.redisClient.hGetAll(`gameId: ${gameId} or userId`);
		if (!gameData || Object.keys(gameData).length === 0) {
			return res.status(404).json({ error: 'Game not found' });
		}

		// before deleting we need to store snapshot of game in mongodb for analytics purpose
		await this.redisClient.del(`gameId: ${gameId} or userId`);

		return res.status(200).json({ message: 'Game ended successfully' });
	}

	getGameState = async (req, res) => {
		const { gameId } = req.query;

		const gameData = await this.redisClient.hGetAll(`gameId: ${gameId} or userId`);
		if (!gameData || Object.keys(gameData).length === 0) {
			return res.status(404).json({ error: 'Game not found' });
		}

		return res.status(200).json({
			fen: gameData.fen,
			pgn: gameData.pgn,
			turn: gameData.turn,
			moves: JSON.parse(gameData.moves),
		});
	}
}