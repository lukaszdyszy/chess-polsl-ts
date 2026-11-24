import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { getLoggedUserInfo, signOut } from "../communication/authCommunication";

export interface UserInfo {
	id: number;
	username: string;
	email: string;
	statistics: {
		elo: number;
	};
}

export interface AuthState {
	loggedUser: UserInfo | null;
}

const initialState: AuthState = {
	loggedUser: null
}

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setLoggedUser(state, action: PayloadAction<UserInfo | null>) {
			state.loggedUser = action.payload;
		}
	}
});

export const loadLoggedUser = (): AppThunk => {
	return async (dispatch, getState) => {
		const userInfo = await getLoggedUserInfo();

		dispatch(authActions.setLoggedUser(userInfo));
	}
}

export const clearSession = (): AppThunk => {
	return async (dispatch, getState) => {
		await signOut();

		dispatch(authActions.setLoggedUser(null));
	}
}

export const authActions = authSlice.actions;

const authReducer = authSlice.reducer;

export default authReducer;