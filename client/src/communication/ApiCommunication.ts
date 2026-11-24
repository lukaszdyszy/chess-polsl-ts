import { authActions } from "../reducers/auth";
import { store } from "../store";

export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH'
};

export type ApiResponse<T> = {
	status: 'success' | 'error';
	message: string;
	data: T;
}

export const sendRequest = async (method: HttpMethod, path: string, body: {} = {}): Promise<Response | false> => {
	const API_ADDRESS = store.getState().conf.apiAddress;

	try {
		const request: RequestInit = {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			}
		};

		if (method !== HttpMethod.GET && body !== null) {
			request.body = JSON.stringify(body);
		}

		return await fetch(`${API_ADDRESS}${path}`, request);
	} catch (err) {
		console.error(err);
		return false;
	}
}

const refreshToken = async (): Promise<boolean> => {
	const response = await sendRequest(HttpMethod.POST, 'auth/refresh');

	if (response && response.ok && ((await response.json()) as ApiResponse<null>).status === 'success') {
		return true;
	} else {
		return false;
	}
}

export const api = async <T>(method: HttpMethod, path: string, body: {} = {}): Promise<ApiResponse<T> | false> => {
	let response = await sendRequest(method, path, body);

	// try to refresh token
	if (response && response.status === 401) {
		const refreshed = await refreshToken();
		if (refreshed) {
			response = await sendRequest(method, path, body);
		} else {
			// user not authenticated - clear session
			store.dispatch(authActions.setLoggedUser(null));
			return false;
		}
	}

	return !response ? false : (await response.json()) as ApiResponse<T>;
}