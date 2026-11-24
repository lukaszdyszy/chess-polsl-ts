import { z } from "zod";

export const GetUserGamesSchema = z.object({
	page: z.coerce.number().positive()
}).strict();

export type GetUserGamesDTO = z.infer<typeof GetUserGamesSchema>;