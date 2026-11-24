class User {
	id: number;
	username: string;
	email: string;
	passwordHash?: string;
	createdAt?: Date;

	constructor(id: number, username: string, email: string, passwordHash: string | undefined, createdAt: Date | undefined) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.passwordHash = passwordHash;
		this.createdAt = createdAt;
	}

	static createNewUser(username: string, email: string, passwordHash: string) {
		return new User(0, username, email, passwordHash, new Date());
	}
}

export default User;