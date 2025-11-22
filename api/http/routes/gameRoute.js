import { Router } from 'express';
import redisClient from '../../../redis/redis.js';
import GameService from '../services/GameService.js';
import GameController from '../controllers/GameController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

/**
 * @description Dependency Injection part
 */
const gameController = new GameController(new GameService(redisClient)); // we can wrap redisClient in to a class singleton class for dependency injection

/**
 * @description Routes for chess game operations
 */
const router = Router();

/* authentication checking for route */
router.use(authenticateToken);

/* Api which will creat chess game */
router.post('/create', gameController.createGame);

/* Api which will make a move */
router.post('/move', gameController.movePiece);

/* Api which will be end of game*/
router.post('/end', gameController.endGame);

/* Api which will be return state of game */
router.get('/state', gameController.getGameState);

export default router;