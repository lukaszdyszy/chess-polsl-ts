import GameSettings from './GameSettings/GameSettings';
import { useAppSelector } from '../../store';
import './Play.scss';
import Game from './Game/Game';

const Play = () => {
	const isWsConnecting = useAppSelector(state => state.global.isWsConnecting);
	const wsConnectionError = useAppSelector(state => state.global.wsConnectionError);
	const game = useAppSelector(state => state.game.gameInfo);

	return <div className='Play-container'>
		{
			// isWsConnecting ? 'Loading...' :
			// 	wsConnectionError !== '' ? <div className='error'>{wsConnectionError}</div> :
			// 		!game ? <GameSettings /> : <Game />
		}

		<Game />
	</div>
}

export default Play;