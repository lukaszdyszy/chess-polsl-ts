import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { globalActions } from "./global";

export interface ConfState {
	apiAddress: string;
	websocketServerAddress: string;
}

const initialState: ConfState = {
	apiAddress: '',
	websocketServerAddress: ''
}

export const confSlice = createSlice({
	name: 'conf',
	initialState,
	reducers: {
		setConfig(state, action: PayloadAction<ConfState>) {
			return action.payload;
		}
	}
});

export const fetchConfig = (): AppThunk => {
	return async (dispatch, getState) => {
		if (getState().global.isFetchingConfig) {
			return;
		}

		dispatch(globalActions.setIsFetchingConfig(true));

		try {
			const result = await fetch(`${process.env.PUBLIC_URL}/config.json`);
			if (!result.ok) {
				throw new Error(result.statusText);
			}

			const config = await result.json();

			dispatch(confSlice.actions.setConfig(config as ConfState));
			dispatch(globalActions.setIsConfigFetched(true));
		} catch (err) {
			console.error(err);
			dispatch(globalActions.setGlobalError('Failed to load config.'));
		} finally {
			dispatch(globalActions.setIsFetchingConfig(false));
		}
	}
}

const confReducer = confSlice.reducer;

export default confReducer;