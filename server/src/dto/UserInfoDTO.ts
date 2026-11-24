import UserStatistics from "../models/UserStatistics.js";

export type UserInfoDTO = {
	id: number;
	username: string;
	email: string;
	statistics: UserStatistics;
}