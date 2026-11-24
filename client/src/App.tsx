import { useEffect } from 'react';
import './App.scss';
import { fetchConfig } from './reducers/conf';
import { useAppDispatch, useAppSelector } from './store';
import Login from './pages/Login/Login';
import { loadLoggedUser } from './reducers/auth';
import { Route, Routes } from 'react-router-dom';
import Play from './pages/Play/Play';
import Profile from './pages/Profile/Profile';
import GamesHistory from './pages/GameHistory/GamesHistory';
import MainMenu from './components/MainMenu/MainMenu';
import wsCommunication from './sockets';

function App() {
	const dispatch = useAppDispatch();

	const isConfigFetched = useAppSelector(state => state.global.isConfigFetched);
	const conf = useAppSelector(state => state.conf);
	const loggedUser = useAppSelector(state => state.auth.loggedUser);

	useEffect(() => {
		if (!isConfigFetched) {
			dispatch(fetchConfig());
		} else {
			dispatch(loadLoggedUser());
		}
	}, [isConfigFetched, dispatch]);

	useEffect(() => {
		if (loggedUser && isConfigFetched) {
			wsCommunication.init(conf.websocketServerAddress);
		}
	}, [loggedUser, isConfigFetched]);

	if (!loggedUser) {
		return <Login />
	}

	return (
		<div className="App">
			<div className="main-menu">
				<MainMenu />
			</div>
			<div className="main-content">
				<Routes>
					<Route path='/' Component={Play} />
					<Route path='/profile' Component={Profile} />
					<Route path='/game-history' Component={GamesHistory} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
