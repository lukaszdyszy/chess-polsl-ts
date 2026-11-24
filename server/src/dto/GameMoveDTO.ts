import { z } from "zod";

export const GameMoveSchema = z.string().min(4).max(5);