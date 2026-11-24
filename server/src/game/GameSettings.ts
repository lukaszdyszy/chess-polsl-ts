import { TimeFormat } from "../lib/types/types.js";

class GameSettings {
	constructor(
		public isRanked: boolean,
		public timeFormat: TimeFormat,
		public eloRange: [number, number]
	) { }
}

export default GameSettings;