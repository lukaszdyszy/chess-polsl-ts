import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface GlobalState {
	isFetchingConfig: boolean;
	isConfigFetched: boolean;
	isWsConnectionOpen: boolean;
	isWsConnecting: boolean;
	wsConnectionError: string;
	globalError: string;
}

const initialState: GlobalState = {
	isFetchingConfig: false,
	isConfigFetched: false,
	isWsConnectionOpen: false,
	isWsConnecting: false,
	wsConnectionError: '',
	globalError: ''
}

export const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setIsFetchingConfig(state, action: PayloadAction<boolean>) {
			state.isFetchingConfig = action.payload;
		},
		setIsConfigFetched(state, action: PayloadAction<boolean>) {
			state.isConfigFetched = action.payload;
		},
		setIsWsConnectionOpen(state, action: PayloadAction<boolean>) {
			state.isWsConnectionOpen = action.payload;
		},
		setIsWsConnecting(state, action: PayloadAction<boolean>) {
			state.isWsConnecting = action.payload;
		},
		setWsConnectionError(state, action: PayloadAction<string>) {
			state.wsConnectionError = action.payload;
		},
		setGlobalError(state, action: PayloadAction<string>) {
			state.globalError = action.payload;
		},
	}
});

export const globalActions = globalSlice.actions;

const globalReducer = globalSlice.reducer;

export default globalReducer;