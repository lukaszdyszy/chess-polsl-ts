import User from "../../models/User.js";
import IUsersRepository from "../../repos/users/IUsersRepository.js";
import IAuthService from "./IAuthService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWTPair, JWTUserPayload } from "../../lib/types/authTypes.js";
import IRefreshTokensRepository from "../../repos/refresh-tokens/IRefreshTokensRepository.js";

class AuthService implements IAuthService {
	constructor(
		private readonly userRepository: IUsersRepository,
		private readonly refreshTokensRepository: IRefreshTokensRepository,
	) { }

	async signIn(username: string, password: string): Promise<[JWTPair, JWTUserPayload] | false> {
		const user: User | null = await this.userRepository.findByUsername(username);

		if (!user) {
			return false;
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash!);
		if (!isPasswordValid) {
			return false;
		}

		const userPayload: JWTUserPayload = {
			userId: user.id,
			username: user.username,
			email: user.email
		};

		const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET as string, { expiresIn: '15m' });
		const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);

		await this.refreshTokensRepository.add(refreshToken, user.id);

		return [{ accessToken, refreshToken }, userPayload];
	}

	async registerUser(username: string, email: string, password: string): Promise<string> {
		let user = await this.userRepository.findByUsername(username);
		if (user !== null) {
			return 'Username already taken.';
		}

		user = await this.userRepository.findByEmail(email);
		if (user !== null) {
			return 'Email already taken.';
		}

		const password_hash = await bcrypt.hash(password, 10);
		user = User.createNewUser(username, email, password_hash);
		const result = await this.userRepository.add(user);

		if (result.rowCount === 0) {
			return 'Failed to create user.';
		}

		return 'Success';
	}

	async refresh(refreshToken: string): Promise<JWTPair | false> {
		const token = await this.refreshTokensRepository.find(refreshToken);

		if (!token) {
			return false;
		}

		const payload = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as JWTUserPayload;

		const newAccessToken = jwt.sign({ userId: token.userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
		const newRefreshToken = jwt.sign({ userId: token.userId }, process.env.JWT_SECRET as string);

		await this.refreshTokensRepository.delete(token.token);
		await this.refreshTokensRepository.add(newRefreshToken, token.userId);

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken
		};
	}

	async verifyAccessToken(accessToken: string): Promise<JWTUserPayload | false> {
		let payload: JWTUserPayload;

		try {
			payload = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JWTUserPayload;

			return payload;
		} catch (err) {
			return false;
		}
	}

	async signOut(refreshToken: string): Promise<boolean> {
		try {
			await this.refreshTokensRepository.delete(refreshToken);

			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}
}

export default AuthService;