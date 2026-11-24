import { JWTPair, JWTUserPayload } from "../../lib/types/authTypes.js";

interface IAuthService {
	signIn(username: string, password: string): Promise<[JWTPair, JWTUserPayload] | false>;
	registerUser(username: string, email: string, password: string): Promise<string>;
	refresh(refreshToken: string): Promise<JWTPair | false>;
	verifyAccessToken(accessToken: string): Promise<JWTUserPayload | false>;
	signOut(refreshToken: string): Promise<boolean>;
}

export default IAuthService;