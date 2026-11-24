import { WebSocket } from "ws";
import { SocketMessageDTO } from "../dto/SocketMessageDTO.js";

export const sendObj = (socket: WebSocket, msg: SocketMessageDTO) => {
	const msgStr = JSON.stringify(msg);
	socket.send(msgStr);
}

export const sendToMany = (sockets: WebSocket[], msg: SocketMessageDTO) => {
	sockets.forEach(ws => {
		sendObj(ws, msg);
	});
}