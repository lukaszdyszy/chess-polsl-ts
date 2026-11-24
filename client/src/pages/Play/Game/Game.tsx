import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../store"
import Chessboard from "../../../components/Chessboard/Chessboard";
import { Chesslogic, MoveString } from "chess-logic";
import wsCommunication from "../../../sockets";
import { Color, GameInfo } from "../../../lib/types";
import { getColorByTurn } from "../../../lib/utils";
import Timer from "../../../components/Timer/Timer";
import './Game.scss';
import { UserInfo } from "../../../reducers/auth";

const formatRemaining = (ms: number) => {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const clock = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

	return hours > 0 ? `${hours}:${clock}` : clock;
}

const Game = () => {
	const mockedGame: GameInfo = {
		timeStart: Date.now() + 8000,
		players: {
			[Color.WHITE]: {
				id: 1,
				username: "user1",
				elo: 1000
			},
			[Color.BLACK]: {
				id: 2,
				username: "master",
				elo: 1500
			}
		},
		"ranksUpdate": {
			"WHITE": {
				"WHITE": 1501,
				"BLACK": 999
			},
			"BLACK": {
				"WHITE": 1477,
				"BLACK": 1023
			},
			"DRAW": {
				"WHITE": 989,
				"BLACK": 1511
			}
		},
		"disconnectionTimeout": 15000,
		"record": ['3239525:e2e4', '3617184:e7e5', '3268088:d1f3', '3638044:b7b6', '3295521:f1c4', '3666038:a7a6', '3323688:f3f7'],
		"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
		"times": {
			"WHITE": 3585985,
			"BLACK": 3600000
		},
		"result": null
	}

	// const loggedUser = useAppSelector(state => state.auth.loggedUser)!;
	const loggedUser: UserInfo = {
		id: 1,
		username: 'master',
		email: 'master@abc.com',
		statistics: {
			elo: 1500
		}
	};
	// const gameInfo = useAppSelector(state => state.game.gameInfo)!;
	const [gameInfo, setGameInfo] = useState<GameInfo>(mockedGame as GameInfo);


	const [isLoading, setIsLoading] = useState(true);

	const [chesslogic, setChesslogic] = useState(new Chesslogic());

	const [myTurn, setMyTurn] = useState<boolean | undefined>(undefined);
	const [timePlayer, setTimePlayer] = useState<number>(-1);
	const [timeOpponent, setTimeOpponent] = useState<number>(-1);
	const [playerInfo, setPlayerInfo] = useState<{ [key: string]: any }>({});
	const [opponentInfo, setOpponentInfo] = useState<{ [key: string]: any }>({});
	const [countdown, setCountdown] = useState<number>(5000);

	useEffect(() => {
		if (gameInfo) {
			chesslogic.loadFen(gameInfo.fen);

			setTimePlayer(loggedUser.id === gameInfo.players[Color.WHITE].id ? gameInfo.times[Color.WHITE] : gameInfo.times[Color.BLACK]);
			setTimeOpponent(loggedUser.id === gameInfo.players[Color.WHITE].id ? gameInfo.times[Color.BLACK] : gameInfo.times[Color.WHITE]);

			const colorPl = loggedUser.id === gameInfo.players[Color.WHITE].id ? Color.WHITE : Color.BLACK;
			const colorOp = loggedUser.id === gameInfo.players[Color.WHITE].id ? Color.BLACK : Color.WHITE;

			if (
				JSON.stringify(playerInfo) === '{}' &&
				JSON.stringify(opponentInfo) === '{}'
			) {
				setPlayerInfo({
					...gameInfo.players[colorPl],
					color: colorPl
				});
				setOpponentInfo({
					...gameInfo.players[colorOp],
					color: colorOp
				});
			}

			setMyTurn(getColorByTurn(chesslogic.turn) === colorPl);

			// if (Date.now() < gameInfo.timeStart) {
			startCountdown();
			// }
		}
	}, [gameInfo]);

	useEffect(() => {
		if (isLoading) {
			if (
				JSON.stringify(playerInfo) !== '{}' &&
				JSON.stringify(opponentInfo) !== '{}' &&
				timePlayer > -1 &&
				timeOpponent > -1 &&
				myTurn !== undefined
			) {
				setIsLoading(false);
			}
		}
	}, [isLoading, playerInfo, opponentInfo, timePlayer, timeOpponent, myTurn]);

	const startCountdown = () => {
		const newVal = gameInfo.timeStart - Date.now();

		// console.log(newVal);

		setCountdown(newVal);

		if (newVal > 0) {
			setTimeout(startCountdown, 100);
		}
	}

	const moveValidator = (moveString: MoveString): boolean => {
		return chesslogic.isMovePossible(moveString);
	}

	const sendMove = (moveString: MoveString) => {
		wsCommunication.sendMove(moveString);
	}



	const displayRecord = () => {
		const rows = [];

		for (let i = 0; i < gameInfo.record.length; i += 2) {
			const mvNr = i / 2 + 1;

			rows.push(
				<div className="Game-record-row" key={mvNr}>
					<div className="Game-record-row-nr">{mvNr}.</div>
					{renderRecordMove(gameInfo.record[i])}
					{renderRecordMove(i + 1 < gameInfo.record.length ? gameInfo.record[i + 1] : '')}
				</div>
			);
		}

		return rows;
	}

	const renderRecordMove = (entry: string) => {
		if (!entry) {
			return <div className="Game-record-row-mv" />;
		}

		const separator = entry.indexOf(':');
		const move = separator === -1 ? entry : entry.slice(separator + 1);
		const rawTime = separator === -1 ? NaN : Number(entry.slice(0, separator));

		return (
			<div className="Game-record-row-mv">
				<span className="Game-record-move">{move}</span>
				{Number.isFinite(rawTime) ? <span className="Game-record-time">{formatRemaining(rawTime)}</span> : null}
			</div>
		);
	}

	return <div className="Game-container">
		{isLoading ? 'Loading...' :
			<>
				<div className="Game-main">
					<div className="Game-player">
						<div className="Game-player-info">
							<div className="Game-player-avatar">{opponentInfo.username.charAt(0).toUpperCase()}</div>
							{opponentInfo.username}, {opponentInfo.elo}
						</div>
						<div className="Game-player-timer">
							<Timer
								syncTime={timeOpponent}
								pause={myTurn || countdown > 0}
							/>
						</div>
					</div>
					<div className="Game-board">
						{countdown > 0 ? <div className="Game-countdown">{Math.floor(countdown / 1000)}</div> : null}
						<Chessboard
							fen={gameInfo!.fen}
							validator={moveValidator}
							onMove={sendMove}
							oerientation={loggedUser.id === gameInfo.players[Color.WHITE].id ? Color.WHITE : Color.BLACK}
							lock={countdown > 0}
						/>
					</div>
					<div className="Game-player">
						<div className="Game-player-info">
							<div className="Game-player-avatar">{loggedUser.username.charAt(0).toUpperCase()}</div>
							{loggedUser.username}, {loggedUser.statistics.elo}
						</div>
						<div className="Game-player-timer">
							<Timer
								syncTime={timePlayer}
								pause={!myTurn || countdown > 0}
							/>
						</div>
					</div>
				</div>
				<div className="Game-side">
					<div className="Game-record">
						<div className="Game-record-header">
							<div className="Game-record-row-nr">#</div>
							<div>White</div>
							<div>Black</div>
						</div>
						<div className="Game-record-body">
							{displayRecord()}
						</div>
					</div>
					<div className="Game-options">
						<button className="App-button">Resign</button>
						<button className="App-button">Propose draw</button>
					</div>
				</div>
			</>
		}
	</div>

}

export default Game;