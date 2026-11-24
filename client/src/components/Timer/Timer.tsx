import { current } from "@reduxjs/toolkit";
import React, { useState, useEffect, useRef, useCallback } from "react";
import './Timer.scss';

export interface TimerProps {
	syncTime: number;
	pause?: boolean;
	onTimeout?: () => void;
}

const Timer = ({
	syncTime,
	pause = false,
	onTimeout = () => { }
}: TimerProps) => {
	const [currentTime, setCurrentTime] = useState<number>(syncTime);

	const intervalId = useRef<NodeJS.Timer | null>(null);

	const getFormattedTime = () => {
		let seconds = currentTime / 1000;
		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);

		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	useEffect(() => {
		setCurrentTime(syncTime);

		if (pause && intervalId.current !== null) {
			clearInterval(intervalId.current);
			intervalId.current = null;
		} else if (!pause && intervalId.current === null) {
			const referenceTime = Date.now();
			intervalId.current = setInterval(() => {
				const time = Date.now() - referenceTime;

				let newTime = syncTime - time;
				if (newTime <= 0) newTime = 0;
				setCurrentTime(newTime);
			}, 1000);
		}
	}, [syncTime, pause]);

	return (
		<div className="Timer">
			{getFormattedTime()}
		</div>
	);
};

export default Timer;