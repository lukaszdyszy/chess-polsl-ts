import { parseCookie } from "cookie";
import { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import UserOnline, { UserOnlineDTO } from "./UserOnline.js";
import IAuthService from "../services/auth/IAuthService.js";
import IUsersService from "../services/users/IUsersService.js";
import Game from "../game/Game.js";
import WaitingQueue from "../game/WaitingQueue.js";
import { SocketMessageDTO, SocketMessageSchema } from "../dto/SocketMessageDTO.js";
import { AddToWaitingQueueSchema } from "../dto/AddToWaitingQueueDTO.js";
import GameSettings from "../game/GameSettings.js";
import { GameMoveSchema } from "../dto/GameMoveDTO.js";
import { MoveString } from "chess-logic";
import { sendObj, sendToMany } from "./SocketHelpers.js";
import IGamesRepository from "../repos/games/IGamesRepository.js";
import { GameEndReason, GameWinner } from "../lib/types/types.js";

class SocketManager {
	wss: WebSocketServer;
	authService: IAuthService;
	usersService: IUsersService;
	gamesRepository: IGamesRepository;

	usersOnline: Map<number, UserOnline>;
	games: Map<string, Game>;

	waitingQueue: WaitingQueue;

	constructor(
		server: Server,
		authService: IAuthService,
		usersService: IUsersService,
		gamesRepository: IGamesRepository
	) {
		// -----
		this.authService = authService;
		this.usersService = usersService;
		this.gamesRepository = gamesRepository;

		// -----
		this.usersOnline = new Map<number, UserOnline>();
		this.games = new Map<string, Game>();
		this.waitingQueue = new WaitingQueue();

		// -----
		this.wss = new WebSocketServer({ noServer: true });
		this.handleConnection();
		this.init(server);
	}

	private async init(server: Server) {
		server.on("upgrade", async (req, socket, head) => {
			const start = Date.now();
			const log = `${req.socket.remoteAddress} ${(new Date()).toISOString()} UPGRADE /`;

			const cookies = parseCookie(req.headers.cookie ?? '');
			const userPayload = cookies.accessToken === undefined ? null : await this.authService.verifyAccessToken(cookies.accessToken);

			if (!userPayload) {
				console.log(`${log} 401 ${Date.now() - start} ms`);
				socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
				socket.destroy();
				return;
			}

			this.wss.handleUpgrade(req, socket, head, async (ws) => {
				console.log(`${log} 101 ${Date.now() - start} ms`);
				ws.userId = userPayload.userId;
				ws.username = userPayload.username;

				if (this.usersOnline.has(userPayload.userId)) {
					this.handleUserReconnection(userPayload.userId, ws);
				} else {
					const userOnline = await this.usersService.getUserAsUserOnline(userPayload.userId, ws);
					this.usersOnline.set(userPayload.userId, userOnline);
				}

				this.wss.emit("connection", ws, req);
			});
		});
	}

	private async handleConnection() {
		this.wss.on("connection", async (ws, req) => {
			console.log(`WS CONNECTED ${ws.userId}:${ws.username}`);

			// setInterval(() => {
			// 	ws.ping();
			// }, 5000);

			ws.on('close', async () => {
				console.log(`WS CLOSED ${ws.userId}:${ws.username}`);
				this.handleDisconnection(ws);
			});

			ws.on('message', (data) => {
				try {
					const dataObj = SocketMessageSchema.parse(JSON.parse(data.toString()));

					switch (dataObj.type) {
						case 'play:join_queue':
							this.addToWaitingQueue(ws.userId, dataObj);
							break;
						case 'play:leave_queue':
							this.deleteFromWaitingQueue(ws.userId);
							break;
						case 'game:move':
							this.gameMove(ws.userId, dataObj);
							break;
						case 'game:resign':
							this.gameResign(ws.userId);
							break;
					}
				} catch (err) {
					console.error(err);
				}
			});
		});
	}

	private handleDisconnection(ws: WebSocket) {
		const user = this.usersOnline.get(ws.userId)!;

		// user disconnected during game
		if (user.activeGameIdentifier) {
			const game = this.games.get(user.activeGameIdentifier)!;
			const opponent = Object.values(game.players).find(p => p.id !== user.id)!;

			// notify opponent
			sendObj(opponent.ws, {
				type: 'game:opponent_disconnected',
				data: game.disconnectionTimeout
			});

			// give user time to reconnect, then end game
			user.timeout = setTimeout(() => {
				game.end(GameEndReason.DISCONNECT, game.players.WHITE.id === user.id ? GameWinner.BLACK : GameWinner.WHITE);
				this.updateGame(game);
				this.usersOnline.delete(user.id);
			}, game.disconnectionTimeout);
		} else {
			this.usersOnline.delete(user.id);
			this.waitingQueue.pop(user.id);
		}
	}

	private handleUserReconnection(userId: number, ws: WebSocket) {
		const userOnline = this.usersOnline.get(userId)!;

		if (userOnline.ws.readyState === WebSocket.OPEN) {
			sendObj(userOnline.ws, { type: 'connected_from_another_device' });
			userOnline.ws.close();
		}

		if (userOnline.timeout !== null) {
			userOnline.cancelTimeout();

			if (userOnline.activeGameIdentifier !== null) {
				const game = this.games.get(userOnline.activeGameIdentifier)!;

				sendObj(ws, { type: 'game:reconnected', data: game.toGameInfo() });

				const opponent = Object.values(game.players).find(p => p.id !== userOnline.id)!;
				sendObj(opponent.ws, { type: 'game:opponent_reconnected' });
			}
		}

		userOnline.ws = ws;
	}


	private addToWaitingQueue(userId: number, data: SocketMessageDTO) {
		const user = this.usersOnline.get(userId)!;

		const gameSettings: GameSettings = AddToWaitingQueueSchema.parse(data.data);

		const match = this.waitingQueue.push(user, gameSettings);

		// found match
		if (match) {
			// randomize the color and initialize the game
			const rnd = Math.round(Math.random());
			const newGame = new Game(
				match[rnd].user,
				match[Number(!rnd)].user,
				gameSettings.timeFormat,
				gameSettings.isRanked
			);

			// generate uuid of the game
			const gameUUID = uuidv4();
			this.games.set(gameUUID, newGame);
			match[0].user.activeGameIdentifier = gameUUID;
			match[1].user.activeGameIdentifier = gameUUID;

			// emit game start
			sendToMany(match.map(el => el.user.ws), {
				type: 'game:start',
				data: newGame.toGameInfo()
			});
		}
	}

	private deleteFromWaitingQueue(userId: number) {
		this.waitingQueue.pop(userId);
	}

	private gameMove(userId: number, data: SocketMessageDTO) {
		const moveString = GameMoveSchema.parse(data.data);

		const user = this.usersOnline.get(userId)!;
		const game = this.games.get(user.activeGameIdentifier!)!;

		const result = game.move(userId, moveString as MoveString);
		if (result) {
			this.updateGame(game);
		} else {
			sendObj(user.ws, {
				type: 'game:invalid_move'
			});
		}
	}

	private gameResign(userId: number) {
		const game = this.games.get(this.usersOnline.get(userId)!.activeGameIdentifier!)!;
		const players = game.getPlayersInfoMappedById();

		game.end(GameEndReason.RESIGN, GameWinner[players[userId].color]);

		this.updateGame(game);
	}

	private gameProposeDraw(userId: number) {
		const game = this.games.get(this.usersOnline.get(userId)!.activeGameIdentifier!)!;
		const opponent = game.getOpponentByPlayerId(userId);

		sendObj(opponent.ws, {
			type: 'game:draw_proposal'
		});
	}

	private gameAcceptDraw(userId: number) {
		const game = this.games.get(this.usersOnline.get(userId)!.activeGameIdentifier!)!;

		game.end(GameEndReason.AGREEMENT, GameWinner.DRAW);

		this.updateGame(game);
	}

	private updateGame(game: Game) {
		sendToMany(Object.values(game.players).map(p => p.ws), {
			type: 'game:status',
			data: game.toGameStatus()
		});

		// game finished
		if (game.result) {
			this.gamesRepository.save(game.toGameModel());

			this.games.delete(game.players.WHITE.activeGameIdentifier!);
			game.players.WHITE.activeGameIdentifier = null;
			game.players.BLACK.activeGameIdentifier = null;
		}
	}

	getUsersOnline() {
		const ret: UserOnlineDTO[] = [];

		this.usersOnline.forEach(u => {
			ret.push(u.toDto());
		});

		return ret;
	}
}

export default SocketManager;