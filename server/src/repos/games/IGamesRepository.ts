import Game from "../../models/Game.js";

interface IGamesRepository {
	save(game: Game): Promise<Game>;
	findGamesByUserId(userId: number, pageSize: number, page: number): Promise<Game[]>;
}

export default IGamesRepository;