import UserOnline from "../sockets/UserOnline.js";
import GameSettings from "./GameSettings.js";

class WaitingQueue {
	queue: Map<number, WaitingQueueElement>;

	constructor() {
		this.queue = new Map<number, WaitingQueueElement>();
	}

	push(user: UserOnline, gameSettings: GameSettings): [WaitingQueueElement, WaitingQueueElement] | false {
		const newEl = new WaitingQueueElement(user, gameSettings);
		let match: WaitingQueueElement;

		// look for match
		for (const [key, el] of this.queue) {
			if (el.compareTo(newEl)) {
				return [el, newEl];
			}
		}

		this.queue.set(user.id, newEl);

		return false;
	}

	pop(userId: number) {
		this.queue.delete(userId);
	}
}

class WaitingQueueElement {
	constructor(
		public user: UserOnline,
		public gameSettings: GameSettings
	) { }

	compareTo(el: WaitingQueueElement) {
		const isRankedMatch = el.gameSettings.isRanked === this.gameSettings.isRanked;
		const timeFormatMatch = el.gameSettings.timeFormat === this.gameSettings.timeFormat;
		const eloRangeMatch = (
			el.user.elo >= this.gameSettings.eloRange[0] && el.user.elo <= this.gameSettings.eloRange[1]
			&& this.user.elo >= el.gameSettings.eloRange[0] && this.user.elo <= el.gameSettings.eloRange[1]
		);

		return isRankedMatch && timeFormatMatch && eloRangeMatch;
	}
}

export default WaitingQueue;