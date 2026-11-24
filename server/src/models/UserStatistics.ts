class UserStatistics {
	userId: number;
	elo: number;

	constructor(userId: number, elo: number) {
		this.userId = userId;
		this.elo = elo;
	}
}

export default UserStatistics;