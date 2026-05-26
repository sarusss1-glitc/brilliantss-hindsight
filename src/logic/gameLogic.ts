import type { Direction, Piece } from "../types";

/**
 * Stack (undoPath) rules:
 * - undoPath[0] is the current undo direction; each success shifts (removes) it.
 * - Exit: target OOB only when undoPath.length === 1 (final segment).
 * - Invalid: OOB with length > 1, or in-bounds move that would empty the stack.
 *
 * Elastic push:
 * - Occupied target → push blocker one cell along move vector if landing in-bounds and empty.
 * - Pushed piece keeps its undoPath; only the active piece consumes a segment.
 * - At most one piece pushed per move.
 */

export function getUndoTargetFromPosition(
  row: number,
  col: number,
  dir: Direction,
): { row: number; col: number } {
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

export function getUndoTarget(piece: Piece): { row: number; col: number } {
  if (piece.undoPath.length === 0) {
    throw new Error("getUndoTarget: empty undoPath");
  }
  return getUndoTargetFromPosition(piece.row, piece.col, piece.undoPath[0]);
}

export function isOutOfBounds(row: number, col: number): boolean {
  return row < 0 || row > 3 || col < 0 || col > 3;
}

export function getBlocker(
  pieces: Piece[],
  target: { row: number; col: number },
  movingId: string,
): Piece | null {
  if (isOutOfBounds(target.row, target.col)) {
    return null;
  }
  return (
    pieces.find(
      (p) => p.id !== movingId && p.row === target.row && p.col === target.col,
    ) ?? null
  );
}

function isCellFree(
  pieces: Piece[],
  row: number,
  col: number,
  excludeIds: string[],
): boolean {
  return !pieces.some(
    (p) => !excludeIds.includes(p.id) && p.row === row && p.col === col,
  );
}

function applyInBoundsMove(
  pieces: Piece[],
  pieceId: string,
  target: { row: number; col: number },
  newPath: Direction[],
  push?: { blockerId: string; toRow: number; toCol: number },
): Piece[] {
  return pieces.map((p) => {
    if (p.id === pieceId) {
      return {
        ...p,
        row: target.row,
        col: target.col,
        undoPath: newPath,
        movesLeft: newPath.length,
      };
    }
    if (push && p.id === push.blockerId) {
      return { ...p, row: push.toRow, col: push.toCol };
    }
    return p;
  });
}

export function undoPiece(
  pieces: Piece[],
  pieceId: string,
): {
  updatedPieces: Piece[];
  result: "success" | "blocked" | "invalid";
  blockerId: string | null;
} {
  const piece = pieces.find((p) => p.id === pieceId);
  if (
    !piece ||
    piece.undoPath.length === 0 ||
    piece.movesLeft !== piece.undoPath.length
  ) {
    return { updatedPieces: pieces, result: "invalid", blockerId: null };
  }

  const target = getUndoTarget(piece);

  if (isOutOfBounds(target.row, target.col)) {
    if (piece.undoPath.length !== 1) {
      return { updatedPieces: pieces, result: "invalid", blockerId: null };
    }
    return {
      updatedPieces: pieces.filter((p) => p.id !== pieceId),
      result: "success",
      blockerId: null,
    };
  }

  const newPath = piece.undoPath.slice(1);
  if (newPath.length === 0) {
    return { updatedPieces: pieces, result: "invalid", blockerId: null };
  }

  const blocker = getBlocker(pieces, target, pieceId);
  if (blocker) {
    const dRow = target.row - piece.row;
    const dCol = target.col - piece.col;
    const pushRow = blocker.row + dRow;
    const pushCol = blocker.col + dCol;

    if (
      isOutOfBounds(pushRow, pushCol) ||
      !isCellFree(pieces, pushRow, pushCol, [pieceId, blocker.id])
    ) {
      return {
        updatedPieces: pieces,
        result: "blocked",
        blockerId: blocker.id,
      };
    }

    return {
      updatedPieces: applyInBoundsMove(pieces, pieceId, target, newPath, {
        blockerId: blocker.id,
        toRow: pushRow,
        toCol: pushCol,
      }),
      result: "success",
      blockerId: null,
    };
  }

  return {
    updatedPieces: applyInBoundsMove(pieces, pieceId, target, newPath),
    result: "success",
    blockerId: null,
  };
}

export function checkWin(pieces: Piece[]): boolean {
  return pieces.length === 0;
}

export function calculateStars(moves: number, optimal: number): number {
  if (moves <= optimal) return 3;
  if (moves <= optimal + 2) return 2;
  return 1;
}
