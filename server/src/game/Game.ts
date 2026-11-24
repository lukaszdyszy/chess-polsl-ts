import { Chesslogic, MoveString } from "chess-logic";
import UserOnline from "../sockets/UserOnline.js";
import { Color, GameEndReason, GameResult, GameWinner, RanksUpdate, TimeFormat } from "../lib/types/types.js";
import { default as GameModel } from "../models/Game.js";
import { getColorByTurn } from "../lib/utils.js";

// time between initializing the game, and start of the game (ms)
const GAME_BEGIN_DELAY = 5000;

// how often to check for player timout (ms)
const PLAYER_TIMEOUT_INTERVAL = 1000;

class Game {
	chesslogic: Chesslogic;

	id: number = 0;

	players: {
		[Color.WHITE]: UserOnline;
		[Color.BLACK]: UserOnline;
	};
	isRanked: boolean;

	disconnectionTimeout: number;		// time to wait for player to reconnect (ms)

	timeFormat: TimeFormat;				// limit|plus
	timeLimit: number;					// time limit in ms
	timePlus: number;					// time added after every move
	lastMoveTime: number;				// timestamp
	timeReference: number;				// time reference for timeouts check
	times: {							// current times of players
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	timeStart: number;					// time of the start of the game
	timeEnd: number = 0;				// time of the end of the game

	record: string[] = [];				// game record

	result: GameResult | null = null;	// null - game is ongoing, else: game finished

	ranksBefore: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	ranksUpdate: RanksUpdate | null = null;

	usersTimeoutWorker: NodeJS.Timeout | null = null;
	usersTimeoutCallback: () => void;

	constructor(
		playerWhite: UserOnline,
		playerBlack: UserOnline,
		timeFormat: TimeFormat = '15|10',
		isRanked = true,
		usersTimeoutCallback: () => void = () => { },
		disconnectionTimeout = 15000,
	) {
		this.players = {
			[Color.WHITE]: playerWhite,
			[Color.BLACK]: playerBlack
		};

		this.chesslogic = new Chesslogic();

		this.ranksBefore = {
			[Color.WHITE]: playerWhite.elo,
			[Color.BLACK]: playerBlack.elo
		};

		this.isRanked = isRanked;
		if (isRanked) {
			this.ranksUpdate = this.calculateRanksUpdate();
		}

		// time measuring
		this.timeFormat = timeFormat;
		this.timeLimit = (+timeFormat.split('|')[0]) * 60 * 1000;
		this.timePlus = (+timeFormat.split('|')[1]) * 1000;
		this.times = {
			[Color.WHITE]: this.timeLimit,
			[Color.BLACK]: this.timeLimit
		};
		this.timeStart = Date.now() + GAME_BEGIN_DELAY;
		this.lastMoveTime = this.timeStart;
		this.timeReference = this.timeStart;
		this.usersTimeoutCallback = usersTimeoutCallback;
		setTimeout(this.setUsersTimeoutWorker, GAME_BEGIN_DELAY);

		// disconnection timeout
		this.disconnectionTimeout = disconnectionTimeout;
	}

	// check for users timeout
	setUsersTimeoutWorker = () => {
		this.usersTimeoutWorker = setInterval(() => {
			const color = getColorByTurn(this.chesslogic.turn);
			const colorOpposite = color === Color.WHITE ? Color.BLACK : Color.WHITE;

			this.times[color] = this.times[color] - (Date.now() - this.timeReference);
			this.timeReference = Date.now();

			if (this.times[color] <= 0) {
				this.times[color] = 0;
				this.end(GameEndReason.TIMEOUT, GameWinner[colorOpposite]);
				this.usersTimeoutCallback();
			}
		}, PLAYER_TIMEOUT_INTERVAL);
	}

	move(userId: number, moveString: MoveString): boolean {
		const color = getColorByTurn(this.chesslogic.turn);
		if (this.players[color].id !== userId) {
			return false;
		}

		const colorOpposite = color === Color.WHITE ? Color.BLACK : Color.WHITE;

		const moveTime = Date.now();

		const updatedTime = this.times[color] - (moveTime - this.timeReference);
		this.timeReference = Date.now();
		if (updatedTime <= 0) {
			this.times[color] = 0;

			this.end(GameEndReason.TIMEOUT, GameWinner[colorOpposite]);
		}

		const moveResult = this.chesslogic.move(moveString);

		if (moveResult) {
			this.times[color] = updatedTime + this.timePlus;
			this.record.push(`${this.times[color]}:${moveString}`);
			this.lastMoveTime = moveTime;

			if (this.chesslogic.isMate()) {
				this.end(GameEndReason.CHECKMATE, GameWinner[color]);
			}

			if (this.chesslogic.isStaleMate()) {
				this.end(GameEndReason.STALEMATE, GameWinner[color]);
			}
		}

		return moveResult;
	}

	end(reason: GameEndReason, winner: GameWinner) {
		this.timeEnd = Date.now();
		this.result = {
			reason: reason,
			winner: winner
		}

		if (this.usersTimeoutWorker) {
			clearInterval(this.usersTimeoutWorker)
			this.usersTimeoutWorker = null;
		}
	}

	getPlayerById(userId: number) {
		return this.getPlayersInfoMappedById()[userId];
	}

	getOpponentByPlayerId(userId: number) {
		return Object.values(this.players).find(p => p.id !== userId)!;
	}

	getPlayersInfoMappedById() {
		return {
			[this.players[Color.WHITE].id]: {
				...this.players[Color.WHITE].toDto(),
				color: Color.WHITE
			},
			[this.players[Color.BLACK].id]: {
				...this.players[Color.BLACK].toDto(),
				color: Color.BLACK
			}
		}
	}

	private calculateRanksUpdate() {
		const K = 24;

		let E0 = 1 / (1 + Math.pow(10, (this.players[Color.WHITE].elo - this.players[Color.BLACK].elo) / 400));
		let E1 = 1 / (1 + Math.pow(10, (this.players[Color.BLACK].elo - this.players[Color.WHITE].elo) / 400));

		// black wins
		let R0 = this.players[Color.BLACK].elo + K * (1 - E0);
		let R1 = this.players[Color.WHITE].elo + K * (0 - E1);
		const winnerWhite = {
			[Color.WHITE]: Math.round(R0),
			[Color.BLACK]: Math.round(R1)
		};

		// white wins
		R0 = this.players[Color.BLACK].elo + K * (0 - E0);
		R1 = this.players[Color.WHITE].elo + K * (1 - E1);
		const winnerBlack = {
			[Color.WHITE]: Math.round(R0),
			[Color.BLACK]: Math.round(R1)
		};

		// draw
		R0 = this.players[Color.WHITE].elo + K * (0.5 - E0);
		R1 = this.players[Color.BLACK].elo + K * (0.5 - E1);
		const winnerDraw = {
			[Color.WHITE]: Math.round(R0),
			[Color.BLACK]: Math.round(R1)
		};

		return {
			[GameWinner.WHITE]: winnerWhite,
			[GameWinner.BLACK]: winnerBlack,
			[GameWinner.DRAW]: winnerDraw
		};
	}

	toGameInfo() {
		return {
			timeStart: this.timeStart,
			players: {
				[Color.WHITE]: this.players[Color.WHITE].toDto(),
				[Color.BLACK]: this.players[Color.BLACK].toDto()
			},
			ranksUpdate: this.ranksUpdate,
			disconnectionTimeout: this.disconnectionTimeout,
			record: this.record,
			...this.toGameStatus()
		}
	}

	toGameStatus() {
		return {
			fen: this.chesslogic.getFEN(),
			times: this.times,
			lastMove: this.record.length > 0 ? this.record[this.record.length - 1] : '',
			result: this.result
		}
	}

	toGameModel() {
		return new GameModel(
			0,
			new Date(this.timeStart),
			new Date(this.timeEnd),
			this.timeFormat,
			this.isRanked,
			this.disconnectionTimeout,
			this.players[Color.WHITE].id,
			this.players[Color.BLACK].id,
			this.ranksBefore[Color.WHITE],
			this.ranksBefore[Color.BLACK],
			this.ranksUpdate![this.result!.winner][Color.WHITE],
			this.ranksUpdate![this.result!.winner][Color.BLACK],
			this.result!.winner,
			this.result!.reason,
			this.record.join(';')
		);
	}
}

export default Game;