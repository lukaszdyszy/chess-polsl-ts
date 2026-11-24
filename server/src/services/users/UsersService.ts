import WebSocket from "ws";
import User from "../../models/User.js";
import UserOnline from "../../sockets/UserOnline.js";
import IUsersService from "./IUsersService.js";
import IUsersRepository from "../../repos/users/IUsersRepository.js";
import { UserInfoDTO } from "../../dto/UserInfoDTO.js";

class UsersService implements IUsersService {
	constructor(
		private readonly userRepository: IUsersRepository
	) { }

	async getUserInfo(userId: number): Promise<UserInfoDTO> {
		const user = await this.userRepository.findById(userId);
		if (user === null) {
			throw new Error(`User not found, id: ${userId}`);
		}

		const us = await this.userRepository.getUserStatistics(userId);
		if (us === null) {
			throw new Error(`Data inconsistance! No statistics for user: ${userId}`);
		}

		const userInfoDto: UserInfoDTO = {
			id: user.id,
			username: user.username,
			email: user.email,
			statistics: us
		};

		return userInfoDto;
	}

	async getUserAsUserOnline(userId: number, ws: WebSocket): Promise<UserOnline> {
		const userInfo = await this.getUserInfo(userId);

		return new UserOnline(userInfo.id, userInfo.username, userInfo.statistics.elo, ws);
	}
}

export default UsersService;