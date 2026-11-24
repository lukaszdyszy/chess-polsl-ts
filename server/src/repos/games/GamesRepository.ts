import { query } from "../../db/index.js";
import Game from "../../models/Game.js";
import IGamesRepository from "./IGamesRepository.js";

class GamesRepository implements IGamesRepository {
	mapRow(row: any): Game {
		return new Game(
			row.id,
			row.time_start,
			row.time_end,
			row.timeformat,
			row.is_ranked,
			row.disconnection_timeout,
			row.white_user_id,
			row.black_user_id,
			row.white_rating_before,
			row.black_rating_before,
			row.white_rating_after,
			row.black_rating_after,
			row.winner,
			row.reason,
			row.record,
			row.white_username,
			row.black_username
		);
	}

	async save(game: Game): Promise<Game> {
		const result = await query(
			`INSERT INTO games(
				time_start,
				time_end,
				timeformat,
				is_ranked,
				disconnection_timeout,
				white_user_id,
				black_user_id,
				white_rating_before,
				black_rating_before,
				white_rating_after,
				black_rating_after,
				winner,
				reason,
				record
			) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
			[
				game.timeStart,
				game.timeEnd!,
				game.timeFormat,
				game.isRanked,
				game.disconnectionTimeout,
				game.whiteUserId,
				game.blackUserId,
				game.whiteRatingBefore,
				game.blackRatingBefore,
				game.whiteRatingAfter,
				game.blackRatingAfter,
				game.winner,
				game.reason,
				game.record
			]
		);

		game.id = result.rows[0].id;

		return game;
	}

	async findGamesByUserId(userId: number, pageSize: number, page: number): Promise<Game[]> {
		const result = await query(
			`SELECT
				games.*,
				white.username as "white_username",
				black.username as "black_username"
			FROM
				games
				join users white on games.white_user_id = white.id
				join users black on games.black_user_id = black.id
			WHERE 
				white_user_id = $1 OR black_user_id = $1
			ORDER BY
				time_end desc
			LIMIT $2
			OFFSET $3;`,
			[userId, pageSize, pageSize * (page - 1)]
		);

		return result.rows.map(row => {
			return this.mapRow(row);
		});
	}
}

export default GamesRepository;