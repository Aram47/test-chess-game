import { Chess } from 'chess.js';
import ChessProblem from '../../../models/chessProblems.js';
import InProgressProblem from '../../../models/inProgressProblems.js';
import ChessSolvedProblemsSnapshot from '../../../models/chessSolvedProblemsSnapshot.js';

export default class GameService {
	constructor(redisClient) {
		this.redisClient = redisClient;
	}

	createGame = async (req, res) => {
		// problem id check mongo
		// if not exist return error
		// if exist then create game and stor in Redis and return gameId 
		const { problemId, userId } = req.body;

		const problem = await ChessProblem.findById(problemId);

		if (!problem) {
			return res.status(404).json({ error: 'Chess problem not found' });
		}

		const inProgressGame = await InProgressProblem.findOne({ userId, problemId, isCompleted: false });

		if (inProgressGame) {
			return res.status(200).json({ message: 'Resuming existing game', gameId: inProgressGame._id });
		}

		const game = new Chess(problem.fen);

		const newInProgressGame = new InProgressProblem({
			userId,
			problemId,
			currentFen: game.fen(),
			movesMade: [],
		});

		await newInProgressGame.save();

		await this.redisClient.hSet(userId, problemId, JSON.stringify({
			fen: game.fen(),
			pgn: game.pgn(),
			turn: game.turn(),
			moves: JSON.stringify(game.moves()),
		}));

		return newInProgressGame._id;
	}

	movePiece = async (req, res) => {
		// if not exist in redis return error
		// else check is valid move or not
		// if valid move update fen than move engine step and store in redis
		// check is game over or not
		// if over call endgame function

		const { problemId, userId, from, to } = req.body;
		const activeGame = await InProgressProblem.findOne({ userId, problemId, isCompleted: false });

		if (!activeGame) {
			return res.status(404).json({ error: 'No active game found for this user and problem' });
		}

		let gameData = await this.redisClient.hGet(userId, problemId);
		if (!gameData) {
			return res.status(404).json({ error: 'Game not found' });
		}

		gameData = JSON.parse(gameData);
		const game = new Chess(gameData.fen);
		const move = game.move({ from, to });

		if (!move) {
			return res.status(400).json({ error: 'Invalid move' });
		}

		// Update in-progress problem in MongoDB
		activeGame.currentFen = game.fen();
		activeGame.movesMade.push(move.san);

		if (game.isGameOver()) {
			// Handle game over scenario
			return await this.endGame(req, res);
		}
		
		await this.redisClient.hSet(userId, problemId, JSON.stringify({
			fen: game.fen(),
			pgn: game.pgn(),
			turn: game.turn(),
			moves: JSON.stringify(game.moves()),
		}));

		return res.status(200).json({ message: 'Move made successfully', move });
	}

	endGame = async (req, res) => {
		const { problemId, userId } = req.body;

		const activeGame = await InProgressProblem.findOne({ userId, problemId, isCompleted: false });

		if (!activeGame) {
			return res.status(404).json({ error: 'No active game found for this user and problem' });
		}
		activeGame.isCompleted = true;
		await activeGame.save();

		const gameData = await this.redisClient.hGet(userId, problemId);
		if (!gameData) {
			return res.status(404).json({ error: 'Game not found' });
		}

		const parsedGameData = JSON.parse(gameData);

		// Store snapshot in MongoDB
		const snapshot = new ChessSolvedProblemsSnapshot({
			problemId: activeGame.problemId,
			userId: activeGame.userId,
			movesTaken: activeGame.movesMade,
			timeTakenSeconds: Math.floor((Date.now() - activeGame.createdAt) / 1000),
		});

		await snapshot.save();

		// Remove game from Redis
		
		await this.redisClient.hDel(userId, problemId);

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