import { Request, Response, NextFunction } from 'express';
import container from '../di/index.js';
import { TOKENS } from '../di/tokens.js';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.cookies.accessToken;

	if (!accessToken) {
		return res.sendStatus(401);
	}

	const authService = container.resolve(TOKENS.AuthService);

	const userPayload = await authService.verifyAccessToken(accessToken);
	if (!userPayload) {
		return res.sendStatus(401);
	}

	req.user = userPayload;

	return next();
}

export default authMiddleware;