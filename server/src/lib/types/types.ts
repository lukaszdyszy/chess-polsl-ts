export type TimeFormat = `${number}|${number}`;

export enum Color {
	WHITE = 'WHITE',
	BLACK = 'BLACK'
}

export enum GameWinner {
	WHITE = Color.WHITE,
	BLACK = Color.BLACK,
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