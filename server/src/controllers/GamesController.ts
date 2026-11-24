import ApiResponse from "../lib/classes/ApiResponse.js";
import { Request, Response } from "express";
import IGamesRepository from "../repos/games/IGamesRepository.js";
import { JWTUserPayload } from "../lib/types/authTypes.js";
import { GetUserGamesSchema } from "../dto/GetUserGamesDTO.js";

class GamesController {
	constructor(
		private readonly gamesRepository: IGamesRepository,
	) { }

	getUserGames = async (req: Request, res: Response) => {
		const user = req.user as JWTUserPayload;
		const { page } = GetUserGamesSchema.parse(req.params);

		console.log(page);

		const games = await this.gamesRepository.findGamesByUserId(user.userId, 10, page);

		return res.json(new ApiResponse('success', '', games));
	}
}

export default GamesController;