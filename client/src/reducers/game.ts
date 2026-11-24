import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GameInfo, GameStatus } from "../lib/types"

export interface GameState {
	gameInfo: null | GameInfo;
	isWaiting: boolean;
}

const initialState: GameState = {
	gameInfo: null,
	isWaiting: false
}

export const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		setGameInfo(state, action: PayloadAction<GameInfo | null>) {
			state.gameInfo = action.payload;
		},
		setGameStatus(state, action: PayloadAction<GameStatus>) {
			state.gameInfo!.fen = action.payload.fen;
			state.gameInfo!.times = action.payload.times;
			state.gameInfo!.record.push(action.payload.lastMove);
			state.gameInfo!.result = action.payload.result;
		},
		setIsWaiting(state, action: PayloadAction<boolean>) {
			state.isWaiting = action.payload;
		}
	}
});

export const gameActions = gameSlice.actions;

const gameReducer = gameSlice.reducer;

export default gameReducer;