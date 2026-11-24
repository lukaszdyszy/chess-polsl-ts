import User from "../../models/User.js";
import { QueryResult } from "pg";
import UserStatistics from "../../models/UserStatistics.js";

interface IUsersRepository {
	findById(email: number): Promise<User | null>;
	findByUsername(email: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	add(user: User): Promise<QueryResult>;
	update(user: User): Promise<QueryResult>;
	getUserStatistics(userId: number): Promise<UserStatistics | null>
}

export default IUsersRepository;