import { Request, Response } from "express";
import ApiResponse from "../lib/classes/ApiResponse.js";
import SocketManager from "../sockets/SocketManager.js";
import { WSManager } from "../sockets/index.js";

class UsersController {
	constructor(
		private readonly wsManager: WSManager
	) { }

	getUsersOnline = async (req: Request, res: Response) => {
		if (this.wsManager.socketManager === null) {
			throw new Error('Socket server not initialized');
		}

		const socketManager = this.wsManager.socketManager;

		return res.json(new ApiResponse('success', '', socketManager.getUsersOnline()));
	}
}

export default UsersController;
