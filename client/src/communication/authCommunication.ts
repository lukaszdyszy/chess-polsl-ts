import { UserInfo } from "../reducers/auth";
import { api, ApiResponse, HttpMethod } from "./ApiCommunication";

export const getLoggedUserInfo = async (): Promise<UserInfo | null> => {
	const response = await api<UserInfo>(HttpMethod.GET, 'auth/getLoggedUserInfo');

	return !response ? null : response.data;
}

export const signIn = async (username: string, password: string): Promise<ApiResponse<null> | false> => {
	return await api(HttpMethod.POST, 'auth/signin', {
		username,
		password
	});
}

export const signOut = async () => {
	return await api(HttpMethod.POST, 'auth/signout');
}