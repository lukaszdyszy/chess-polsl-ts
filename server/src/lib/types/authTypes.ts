export type JWTUserPayload = {
	userId: number;
	username: string;
	email: string;
};

export type JWTPair = {
	accessToken: string;
	refreshToken: string;
};