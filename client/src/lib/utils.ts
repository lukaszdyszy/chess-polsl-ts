import { Turn, TURN_WHITE } from "chess-logic";
import { Color } from "./types";

export const getColorByTurn = (turn: Turn): Color => turn === TURN_WHITE ? Color.WHITE : Color.BLACK;