import { Turn } from "chess-logic";
import { Color } from "./types/types.js";

export const getColorByTurn = (turn: Turn): Color => turn === 'w' ? Color.WHITE : Color.BLACK;