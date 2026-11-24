import { MoveString } from "chess-logic";
import { GameInfo, GameSettings, GameStatus, SocketMessageDTO } from "../lib/types";
import { gameActions } from "../reducers/game";
import { globalActions } from "../reducers/global";
import { store } from "../store";

class WSCommunication {
	ws: WebSocket | null = null;

	init(address: string) {
		console.log('initializing socket connection...' + address);
		store.dispatch(globalActions.setIsWsConnecting(true));
		store.dispatch(globalActions.setIsWsConnectionOpen(false));

		this.ws = new WebSocket(address);

		this.ws.onopen = this.onOpen;
		this.ws.onerror = this.onError;
		this.ws.onmessage = this.onMessage;
		this.ws.onclose = this.onClose;
	}

	onOpen() {
		console.log('WS conn open');
		store.dispatch(globalActions.setIsWsConnecting(false));
		store.dispatch(globalActions.setIsWsConnectionOpen(true));
	}

	onError(e: Event) {
		store.dispatch(globalActions.setIsWsConnecting(false));
		store.dispatch(globalActions.setIsWsConnectionOpen(false));
		console.log('WS error: ', e);
	}

	onMessage = (e: MessageEvent) => {
		const data: SocketMessageDTO = JSON.parse(e.data);

		switch (data.type) {
			case 'game:start':
				this.handleGameStartOrReconnected(data.data);
				break;
			case 'game:reconnected':
				this.handleGameStartOrReconnected(data.data);
				break;
			case 'game:status':
				this.handleGameStatus(data.data);
				break;
			default:
				console.log(data);
				break;
		}
	}

	onClose() {
		console.log('WS conn close');
		store.dispatch(globalActions.setIsWsConnectionOpen(false));
	}

	sendObj(obj: SocketMessageDTO) {
		if (this.ws === null) return;

		this.ws.send(JSON.stringify(obj));
	}

	joinQueue(gameSettings: GameSettings) {
		this.sendObj({
			type: 'play:join_queue',
			data: gameSettings
		});

		store.dispatch(gameActions.setIsWaiting(true));
	}

	cancelQueue() {
		this.sendObj({
			type: 'play:leave_queue'
		});

		store.dispatch(gameActions.setIsWaiting(false));
	}

	sendMove(moveString: MoveString) {
		this.sendObj({
			type: "game:move",
			data: moveString
		});
	}

	resign() {
		this.sendObj({
			type: 'game:resign'
		});
	}

	handleGameStartOrReconnected(gameInfo: GameInfo) {
		store.dispatch(gameActions.setGameInfo(gameInfo));
	}

	handleGameStatus(gameStatus: GameStatus) {
		store.dispatch(gameActions.setGameStatus(gameStatus));
	}
}

export default WSCommunication;