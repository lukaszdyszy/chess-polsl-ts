import { useAppSelector } from '../../store';
import { GameEndReason, Game, GameWinner } from '../../lib/types';
import './GameHistory.scss';
import { useEffect, useState } from 'react';
import { fetchUserGames } from '../../communication/gamesCommunication';

const reasonLabel: Record<GameEndReason, string> = {
	[GameEndReason.CHECKMATE]: 'Checkmate',
	[GameEndReason.STALEMATE]: 'Stalemate',
	[GameEndReason.AGREEMENT]: 'Agreement',
	[GameEndReason.RESIGN]: 'Resignation',
	[GameEndReason.TIMEOUT]: 'Timeout',
	[GameEndReason.INSUFFICIENT_MATERIAL]: 'Insufficient material',
	[GameEndReason.THREEFOLD_REPETITION]: 'Threefold repetition',
	[GameEndReason.FIFTY_MOVE_RULE]: 'Fifty-move rule',
	[GameEndReason.DISCONNECT]: 'Disconnect'
};

const formatTimeControl = (timeFormat: string) => {
	console.log(timeFormat);
	const [minutes, increment] = timeFormat.split('|');
	return increment && increment !== '0' ? `${minutes} + ${increment}` : `${minutes} min`;
};

const formatDate = (date: Date) => {
	console.log(date);
	return new Date(date).toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

const GamesHistory = () => {
	const loggedUser = useAppSelector(state => state.auth.loggedUser)!;

	const [history, setHistory] = useState<Game[]>([]);
	const [page, setPage] = useState<number>(1);

	const loadGames = async (pageNr: number) => {
		const games = await fetchUserGames(pageNr);

		setHistory(games);
	}

	useEffect(() => {
		loadGames(page);
	}, [loggedUser, page]);

	return (
		<div className="GameHistory">
			<h1 className="GameHistory-title">Game history</h1>
			<div className="GameHistory-table">
				<div className="GameHistory-header">
					<div>Date</div>
					<div>Opponent</div>
					<div>You</div>
					<div>Result</div>
					<div>Rating</div>
					<div>Time</div>
				</div>
				<div className="GameHistory-body">
					{history.map(game => {
						console.log(game);
						const playedWhite = game.whiteUserId === loggedUser.id;
						const opponent = playedWhite ? game.blackUsername : game.whiteUsername;
						const ratingBefore = playedWhite ? game.whiteRatingBefore : game.blackRatingBefore;
						const ratingAfter = playedWhite ? game.whiteRatingAfter : game.blackRatingAfter;
						const delta = ratingAfter - ratingBefore;
						const outcome = game.winner === GameWinner.DRAW
							? 'draw'
							: (playedWhite && game.winner === GameWinner.WHITE) || (!playedWhite && game.winner === GameWinner.BLACK)
								? 'win'
								: 'loss';
						const outcomeLabel = outcome === 'win' ? 'Win' : outcome === 'loss' ? 'Loss' : 'Draw';

						return (
							<div className="GameHistory-row" key={game.id}>
								<div className="GameHistory-date">{formatDate(game.timeEnd)}</div>
								<div className="GameHistory-opponent">{opponent}</div>
								<div className="GameHistory-color">{playedWhite ? 'White' : 'Black'}</div>
								<div className={`GameHistory-result ${outcome}`}>
									<span className="GameHistory-outcome">{outcomeLabel}</span>
									<span className="GameHistory-reason">{reasonLabel[game.reason]}</span>
								</div>
								<div className="GameHistory-rating">
									<span>{ratingBefore}</span>
									<span className={`GameHistory-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
										{delta > 0 ? `+${delta}` : delta}
									</span>
								</div>
								<div className="GameHistory-time">
									<span>{formatTimeControl(game.timeFormat)}</span>
									{game.isRanked ? <span className="GameHistory-ranked">Ranked</span> : <span className="GameHistory-ranked">Casual</span>}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default GamesHistory;
