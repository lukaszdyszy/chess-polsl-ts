import { z } from "zod";

export const SocketMessageSchema = z.object({
	type: z.string().min(1),
	data: z.any().optional()
}).strict();

export type SocketMessageDTO = z.infer<typeof SocketMessageSchema>;