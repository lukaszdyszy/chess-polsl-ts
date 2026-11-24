declare namespace Express {
	interface Request {
		user?: JWTUserPayload;
	}
}