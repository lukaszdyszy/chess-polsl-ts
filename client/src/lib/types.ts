export type TimeFormat = `${number}|${number}`;

export enum Color {
	WHITE = 'WHITE',
	BLACK = 'BLACK'
}

export enum GameWinner {
	WHITE = 'WHITE',
	BLACK = 'BLACK',
	DRAW = 'DRAW',
}

export enum GameEndReason {
	CHECKMATE = 'CHECKMATE',
	STALEMATE = 'STALEMEATE',
	AGREEMENT = 'AGREEMENT',
	RESIGN = 'RESIGN',
	TIMEOUT = 'TIMEOUT',
	INSUFFICIENT_MATERIAL = 'INSUFFICIENT_MATERIAL',
	THREEFOLD_REPETITION = 'THREEFOLD_REPETITION',
	FIFTY_MOVE_RULE = 'FIFTY_MOVE_RULE',
	DISCONNECT = 'DISCONNECT'
}

export type GameResult = {
	reason: GameEndReason,
	winner: GameWinner
}

export type RanksUpdate = {
	[GameWinner.WHITE]: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	[GameWinner.BLACK]: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	[GameWinner.DRAW]: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
}

export type UserOnlineDTO = {
	id: number;
	username: string;
	elo: number;
}

export type GameSettings = {
	isRanked: boolean;
	timeFormat: TimeFormat;
	eloRange: [number, number];
}

export type SocketMessageDTO = {
	type: string;
	data?: any;
}

export interface GameInfo {
	timeStart: number;
	players: {
		[Color.WHITE]: UserOnlineDTO;
		[Color.BLACK]: UserOnlineDTO;
	};
	ranksUpdate: RanksUpdate;
	disconnectionTimeout: number;
	fen: string;
	times: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	record: string[];
	result: GameResult | null;
}

export interface GameStatus {
	fen: string;
	times: {
		[Color.WHITE]: number;
		[Color.BLACK]: number;
	};
	lastMove: string;
	result: GameResult;
}

export interface Game {
	id: number,
	timeStart: Date,
	timeEnd: Date,
	timeFormat: string,
	isRanked: boolean,
	disconnectionTimeout: number,
	whiteUserId: number,
	blackUserId: number,
	whiteRatingBefore: number,
	blackRatingBefore: number,
	whiteRatingAfter: number,
	blackRatingAfter: number,
	winner: GameWinner,
	reason: GameEndReason,
	record: string,
	whiteUsername: string,
	blackUsername: string
}