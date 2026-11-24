import { useRef } from "react";
import wsCommunication from "../../../sockets";
import { TimeFormat } from "../../../lib/types";
import { useAppSelector } from "../../../store";

const GameSettings = () => {
	const timeFormatRef = useRef<HTMLSelectElement>(null);
	const loggedUser = useAppSelector(state => state.auth.loggedUser)!;
	const isWaiting = useAppSelector(state => state.game.isWaiting);

	const onClickPlay = () => {
		let timeFormat = timeFormatRef.current?.selectedOptions[0].value;
		console.log(timeFormat);
		if (!timeFormat) return;

		wsCommunication.joinQueue({
			isRanked: true,
			timeFormat: timeFormat as TimeFormat,
			eloRange: [loggedUser.statistics.elo - 500, loggedUser.statistics.elo + 500]
		});
	}

	const onClickCancel = () => {
		wsCommunication.cancelQueue();
	}

	return <div className="GameSettings-container">
		{
			isWaiting ? <>
				<span>Searching opponent...</span>
				<button onClick={onClickCancel}>Cancel</button>
			</> : <>
				<label htmlFor="timeFormat">Time format</label>
				<select name="timeFormat" id="timeFormat" ref={timeFormatRef}>
					<option value="3|2">3 + 2</option>
					<option value="15|10">15 + 10</option>
					<option value="5|0">5</option>
					<option value="60|30" selected>60</option>
				</select>

				<button onClick={onClickPlay}>Play</button>
			</>
		}
	</div>
}

export default GameSettings;