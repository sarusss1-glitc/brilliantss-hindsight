import type { Direction, Piece, PieceColor } from "../types";

/** Authoring shape: one fixed undo direction for the whole path (old `dir`). */
export type LegacyPiece = {
  id: string;
  color: PieceColor;
  row: number;
  col: number;
  dir: Direction;
};

function cellAfterUndo(row: number, col: number, dir: Direction) {
  switch (dir) {
    case "right":
      return { row, col: col - 1 };
    case "left":
      return { row, col: col + 1 };
    case "down":
      return { row: row - 1, col };
    case "up":
      return { row: row + 1, col };
  }
}

function isOob(row: number, col: number) {
  return row < 0 || row > 3 || col < 0 || col > 3;
}

/** How many successful undos until this piece exits (constant direction, empty board). */
export function countUndosToExit(row: number, col: number, dir: Direction): number {
  let r = row;
  let c = col;
  let n = 0;
  for (;;) {
    const t = cellAfterUndo(r, c, dir);
    n++;
    if (isOob(t.row, t.col)) return n;
    r = t.row;
    c = t.col;
  }
}

export function pieceFromLegacy(p: LegacyPiece): Piece {
  const n = countUndosToExit(p.row, p.col, p.dir);
  return {
    id: p.id,
    color: p.color,
    row: p.row,
    col: p.col,
    movesLeft: n,
    undoPath: Array.from({ length: n }, () => p.dir),
  };
}
