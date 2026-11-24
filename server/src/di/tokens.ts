import IGamesRepository from "../repos/games/IGamesRepository.js";
import IRefreshTokensRepository from "../repos/refresh-tokens/IRefreshTokensRepository.js";
import IUsersRepository from "../repos/users/IUsersRepository.js";
import IAuthService from "../services/auth/IAuthService.js";
import IUsersService from "../services/users/IUsersService.js";

export class TypedToken<T> {
	readonly _type!: T;

	constructor(public readonly description: string) { }
}

export const TOKENS = {
	UserRepository: new TypedToken<IUsersRepository>('UserRepository'),
	RefreshTokensRepository: new TypedToken<IRefreshTokensRepository>('RefreshTokenRepository'),
	GamesRepository: new TypedToken<IGamesRepository>('GamesRepository'),
	AuthService: new TypedToken<IAuthService>('AuthService'),
	UsersService: new TypedToken<IUsersService>('UsersService'),
};