import GamesRepository from "../repos/games/GamesRepository.js";
import RefreshTokensRepository from "../repos/refresh-tokens/RefreshTokensRepository.js";
import UsersRepository from "../repos/users/UsersRepository.js";
import AuthService from "../services/auth/AuthService.js";
import UsersService from "../services/users/UsersService.js";
import Container from "./Container.js";
import { TOKENS } from "./tokens.js";

const container = new Container();

container.register(TOKENS.UserRepository, () => new UsersRepository());
container.register(TOKENS.RefreshTokensRepository, () => new RefreshTokensRepository());
container.register(TOKENS.GamesRepository, () => new GamesRepository());

container.register(TOKENS.AuthService, () => new AuthService(
	container.resolve(TOKENS.UserRepository),
	container.resolve(TOKENS.RefreshTokensRepository)
));
container.register(TOKENS.UsersService, () => new UsersService(
	container.resolve(TOKENS.UserRepository)
));

export default container;