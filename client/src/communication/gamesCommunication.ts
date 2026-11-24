import { Game } from "../lib/types";
import { api, ApiResponse, HttpMethod } from "./ApiCommunication";

export const fetchUserGames = async (page: number): Promise<Game[]> => {
	const gamesResponse = await api<Game[]>(HttpMethod.GET, `games/${page}`);

	if (!gamesResponse || gamesResponse.status === 'error') {
		console.error(`Error fetching games history: ${gamesResponse ? gamesResponse.message : ''}`);

		return [];
	}

	return gamesResponse.data;
}