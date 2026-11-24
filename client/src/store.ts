import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector, useStore } from 'react-redux'
import globalReducer from './reducers/global';
import confReducer from './reducers/conf';
import authReducer from './reducers/auth';
import gameReducer from './reducers/game';

const appReducer = combineReducers({
	global: globalReducer,
	conf: confReducer,
	auth: authReducer,
	game: gameReducer
});

export const store = configureStore({
	reducer: appReducer
});

// Get the type of our store variable
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();