import { Router } from 'express';
import AuthService from '../services/authService.js';
import AuthController from '../controllers/AuthController.js';

/**
 * @description Dependency Injection part
 */
const authController = new AuthController(new AuthService()); 


/**
 * @description Routes for authentication operations
 */
const router = Router();

/* Api for user registration */
router.post('/register', authController.register);
/* Api for user login */
router.post('/login', authController.login);
/* Api for user logout */
router.post('/logout', authController.logout);

export default router;