
//	console.log('game: ', game);
// 	console.log('fen: ', game.fen());
// 	console.log('pgn: ', game.pgn());
// 	console.log('turn: ', game.turn());
// 	console.log('moves: ', game.moves());
// 	console.log('move: ', game.move({ from: 'e2', to: 'e4' }));
// 	console.log('move: ', game.move({ from: 'e7', to: 'e5' }));
// 	console.log('isGameOver: ', game.isGameOver());
// 	console.log('ascii: ', game.ascii());
// 	res.status(200).json({ message: 'Chess server is running' });

export default class GameService {
	constructor(chessGame, redisClient) {
		this.chessGame = chessGame;
		this.redisClient = redisClient;
	}

	createGame = async (req, res) => {}
	movePiece = async (req, res) => {}
	endGame = async (req, res) => {}
	getGameState = async (req, res) => {}
}