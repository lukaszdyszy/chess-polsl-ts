import { WebSocket } from "ws";

export type UserOnlineDTO = {
	id: number;
	username: string;
	elo: number;
}

class UserOnline {
	id: number;
	username: string;
	elo: number;
	activeGameIdentifier: string | null = null;
	ws: WebSocket;
	timeout: NodeJS.Timeout | null = null;

	constructor(
		id: number,
		username: string,
		elo: number,
		ws: WebSocket
	) {
		this.id = id;
		this.username = username;
		this.elo = elo;
		this.ws = ws;
	}

	toDto(): UserOnlineDTO {
		return {
			id: this.id,
			username: this.username,
			elo: this.elo
		}
	}

	cancelTimeout() {
		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
}

export default UserOnline;