import { QueryResult } from "pg";
import { query } from "../../db/index.js";
import User from "../../models/User.js";
import IUsersRepository from "./IUsersRepository.js";
import UserStatistics from "../../models/UserStatistics.js";

class UsersRepository implements IUsersRepository {
	async findById(id: number): Promise<User | null> {
		const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);

		if (rows.length === 0) return null;

		const row = rows[0];
		return new User(row.id, row.username, row.email, row.password_hash, row.created_at);
	}

	async findByUsername(username: string): Promise<User | null> {
		const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);

		if (rows.length === 0) return null;

		const row = rows[0];
		return new User(row.id, row.username, row.email, row.password_hash, row.created_at);
	}

	async findByEmail(email: string): Promise<User | null> {
		const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);

		if (rows.length === 0) return null;

		const row = rows[0];
		return new User(row.id, row.username, row.email, row.password_hash, row.created_at);
	}

	async add(user: User): Promise<QueryResult> {
		const result = await query(
			'INSERT INTO users(username, email, password_hash) values($1, $2, $3) RETURNING *',
			[user.username, user.email, user.passwordHash]
		);

		return result;
	}

	async update(user: User): Promise<QueryResult> {
		const result = await query('UPDATE users SET username = $1, email = $2, password_hash = $3, confirmed = $4 WHERE id = $5', [user.username, user.email, user.passwordHash, user.id]);
		return result;
	}

	async getUserStatistics(userId: number): Promise<UserStatistics | null> {
		const { rows } = await query(`select * from user_statistics where user_id = $1`, [userId]);

		if (rows.length === 0) return null;

		const row = rows[0];

		return new UserStatistics(userId, row.elo);
	}
}

export default UsersRepository;