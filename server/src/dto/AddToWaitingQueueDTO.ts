import { z } from "zod";
import GameSettings from "../game/GameSettings.js";

export const AddToWaitingQueueSchema = z.toZod<GameSettings>()(z.object({
	isRanked: z.boolean(),
	timeFormat: z.templateLiteral([z.number(), "|", z.number()]),
	eloRange: z.tuple([z.number(), z.number()]),
}));

export type AddToWaitingQueueDTO = z.infer<typeof AddToWaitingQueueSchema>;