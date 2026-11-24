import { WebSocket } from "ws";
import UserOnline from "../../sockets/UserOnline.js";
import { UserInfoDTO } from "../../dto/UserInfoDTO.js";

interface IUsersService {
	getUserInfo(userId: number): Promise<UserInfoDTO>;
	getUserAsUserOnline(userId: number, ws: WebSocket): Promise<UserOnline>;
}

export default IUsersService;