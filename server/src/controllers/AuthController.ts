import { SignInDTO, SignInSchema } from "../dto/SignInDTO.js";
import { SignUpDTO, SignUpSchema } from "../dto/SignUpDTO.js";
import { JWTPair } from "../lib/types/authTypes.js";
import ApiResponse from "../lib/classes/ApiResponse.js";
import IAuthService from "../services/auth/IAuthService.js";
import { Request, Response } from "express";
import IUsersService from "../services/users/IUsersService.js";
import { WSManager } from "../sockets/index.js";

class AuthController {
	constructor(
		private readonly authService: IAuthService,
		private readonly usersService: IUsersService,
		private readonly wsManager: WSManager,
	) { }

	signIn = async (req: Request, res: Response) => {
		const userDto: SignInDTO = SignInSchema.parse(req.body);

		const authResult = await this.authService.signIn(userDto.username, userDto.password);

		if (!authResult) {
			return res.json(new ApiResponse('error', 'Invalid username or password'));
		}

		const [jwtPair, userPayload] = authResult;

		res.cookie('accessToken', jwtPair.accessToken, {
			httpOnly: true,
			sameSite: 'strict'
		});

		res.cookie('refreshToken', jwtPair.refreshToken, {
			path: '/auth/refresh',
			httpOnly: true,
			sameSite: 'none',
		});

		return res.json(new ApiResponse('success', '', userPayload));
	}

	signUp = async (req: Request, res: Response) => {
		const signUpDto: SignUpDTO = SignUpSchema.parse(req.body);

		return res.json(new ApiResponse('success', await this.authService.registerUser(signUpDto.username, signUpDto.email, signUpDto.password)));
	}

	refreshToken = async (req: Request, res: Response) => {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.sendStatus(401);
		}

		const newTokensPair: JWTPair | false = await this.authService.refresh(refreshToken);

		if (!newTokensPair) {
			return res.sendStatus(401);
		}

		res.cookie('accessToken', newTokensPair.accessToken, {
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 15 * 1000,
			secure: process.env.NODE_ENV !== 'development',
		});

		res.cookie('refreshToken', newTokensPair.refreshToken, {
			path: '/auth/refresh',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development',
		});

		return res.json(new ApiResponse('success'));
	}

	signOut = async (req: Request, res: Response) => {
		const refreshToken = req.cookies.refreshToken;

		if (refreshToken) {
			await this.authService.signOut(refreshToken);
		}

		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');

		res.sendStatus(200);
	}

	getLoggedUserInfo = async (req: Request, res: Response) => {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.sendStatus(401);
		}

		const userPayload = await this.authService.verifyAccessToken(accessToken);
		if (!userPayload) {
			return res.sendStatus(401);
		}

		const userInfoDto = await this.usersService.getUserInfo(userPayload.userId);

		return res.json(new ApiResponse('success', '', userInfoDto));
	}
}

export default AuthController;