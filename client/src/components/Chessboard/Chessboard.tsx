import { BLACK_BISHOP, BLACK_KING, BLACK_KNIGHT, BLACK_PAWN, BLACK_QUEEN, BLACK_ROOK, Board, Chesslogic, FieldName, FieldValue, MoveString, Piece, WHITE_BISHOP, WHITE_KING, WHITE_KNIGHT, WHITE_PAWN, WHITE_QUEEN, WHITE_ROOK } from "chess-logic";
import React, { useState, useEffect } from "react";
import './Chessboard.scss';
import { Color } from "../../lib/types";

export interface ChessboardProps {
	fen?: string;
	onMove?: (moveString: MoveString) => void;
	validator?: (moveString: MoveString) => boolean;
	oerientation?: Color;
	lock?: boolean;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Chessboard = ({
	fen = STARTING_FEN,
	onMove = () => { },
	validator = () => true,
	oerientation = Color.WHITE,
	lock = false
}: ChessboardProps) => {
	const [board, setBoard] = useState<Board>(Chesslogic.getBoardFromFen(fen));
	const [moveFrom, setMoveFrom] = useState<[number, number] | null>(null);

	useEffect(() => {
		setBoard(Chesslogic.getBoardFromFen(fen));
	}, [fen]);

	const calcFieldBgPos = (fieldVal: Piece) => {
		const piecesPos: { [key in Piece]: [number, number] } = {
			[WHITE_KING]: [0, 0],
			[WHITE_QUEEN]: [1, 0],
			[WHITE_BISHOP]: [2, 0],
			[WHITE_KNIGHT]: [3, 0],
			[WHITE_ROOK]: [4, 0],
			[WHITE_PAWN]: [5, 0],
			[BLACK_KING]: [0, 1],
			[BLACK_QUEEN]: [1, 1],
			[BLACK_BISHOP]: [2, 1],
			[BLACK_KNIGHT]: [3, 1],
			[BLACK_ROOK]: [4, 1],
			[BLACK_PAWN]: [5, 1]
		}

		return `calc(-100% * ${piecesPos[fieldVal][0]}) calc(-100% * ${piecesPos[fieldVal][1]})`;
	}

	const clickField = (rowId: number, colId: number, FieldValue: FieldValue) => {
		if (lock) return;

		if (moveFrom === null && FieldValue !== '') {
			setMoveFrom([rowId, colId]);
			return;
		}

		if (moveFrom !== null) {
			const moveString = `${Chesslogic.getFieldNameByFieldCoords([7 - moveFrom[0], moveFrom[1]])}${Chesslogic.getFieldNameByFieldCoords([7 - rowId, colId])}` as MoveString;
			console.log('moveStr: ' + moveString);
			if (validator(moveString)) {
				console.log('valid')
				onMove(moveString);
			}
			setMoveFrom(null);
		}
	}

	return <div
		className="Chessboard"
		style={{
			backgroundImage: `url(${process.env.PUBLIC_URL}/boardAssets/default/chessboard.png)`
		}}
	>
		{
			(oerientation === Color.WHITE ? board.slice().reverse() : board.slice()).map((row, rowId) => (oerientation === Color.WHITE ? row : row.slice().reverse()).map((col, colId) => {
				const rowNr = oerientation === Color.WHITE ? rowId : 7 - rowId;
				const colNr = oerientation === Color.WHITE ? colId : 7 - colId;
				return <div
					key={`chessboard-field-${rowNr}-${colNr}`}
					className={`Chessboard-field ${(moveFrom !== null && moveFrom[0] === rowNr && moveFrom[1] === colNr) ? 'active' : ''}`}
					style={col !== '' ? {
						backgroundImage: `url(${process.env.PUBLIC_URL}/boardAssets/default/pieces.png)`,
						backgroundPosition: calcFieldBgPos(col as Piece)
					} : {}}
					onClick={() => { clickField(rowNr, colNr, col); }}
				></div>
			}))
		}
	</div>
}

export default Chessboard;