import { Router, Request, Response, NextFunction } from 'express';
import container from '../di/index.js';
import { TOKENS } from '../di/tokens.js';
import AuthController from '../controllers/AuthController.js';
import { ZodError } from 'zod';
import ApiResponse from '../lib/classes/ApiResponse.js';
import UsersController from '../controllers/UsersController.js';
import wsManager from '../sockets/index.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import GamesController from '../controllers/GamesController.js';

const router = Router();

const authController = new AuthController(
	container.resolve(TOKENS.AuthService),
	container.resolve(TOKENS.UsersService),
	wsManager
);
router.post('/auth/signin', authController.signIn);
router.post('/auth/signup', authController.signUp);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/signout', authController.signOut);
router.get('/auth/getLoggedUserInfo', authController.getLoggedUserInfo);


const usersController = new UsersController(wsManager);
router.get('/users/getUsersOnline', authMiddleware, usersController.getUsersOnline);

const gamesController = new GamesController(container.resolve(TOKENS.GamesRepository));
router.get('/games/:page', authMiddleware, gamesController.getUserGames);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof ZodError) {
		return res
			.status(400)
			.json(new ApiResponse(
				'error',
				`Validation error [${err.issues[0].path[0].toString()}]: ${err.issues[0].message}`
			));
	}

	console.error(err);

	return res.status(500).json(new ApiResponse('error', err.message));
});

export default router;