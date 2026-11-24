class RefreshToken {
	id: number;
	token: string;
	userId: number;

	constructor(id: number, token: string, userId: number) {
		this.id = id;
		this.token = token;
		this.userId = userId;
	}
}

export default RefreshToken;