import { Server } from "node:http";
import SocketManager from "./SocketManager.js";
import container from "../di/index.js";
import { TOKENS } from "../di/tokens.js";

export interface WSManager {
	socketManager: SocketManager | null;
	initialize: (server: Server) => void;
}

const wsManager: WSManager = {
	socketManager: null,
	initialize: (server: Server) => {
		wsManager.socketManager = new SocketManager(
			server,
			container.resolve(TOKENS.AuthService),
			container.resolve(TOKENS.UsersService),
			container.resolve(TOKENS.GamesRepository)
		);
	}
}

export default wsManager;