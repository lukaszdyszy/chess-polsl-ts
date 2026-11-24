import { GameEndReason, GameWinner } from "../lib/types/types.js";

class Game {
	constructor(
		public id: number,
		public timeStart: Date,
		public timeEnd: Date,
		public timeFormat: string,
		public isRanked: boolean,
		public disconnectionTimeout: number,
		public whiteUserId: number,
		public blackUserId: number,
		public whiteRatingBefore: number,
		public blackRatingBefore: number,
		public whiteRatingAfter: number,
		public blackRatingAfter: number,
		public winner: GameWinner,
		public reason: GameEndReason,
		public record: string,
		public whiteUsername?: string,
		public blackUsername?: string
	) { }
}

export default Game;