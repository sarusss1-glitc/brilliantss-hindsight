import type { Piece } from "../types";
import { checkWin, undoPiece } from "./gameLogic";

function stateKey(pieces: Piece[]): string {
  return pieces
    .map(
      (p) =>
        `${p.id}@${p.row},${p.col}:${p.undoPath.join(">")}`,
    )
    .sort()
    .join("|");
}

function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map((p) => ({
    ...p,
    undoPath: [...p.undoPath],
    movesLeft: p.undoPath.length,
  }));
}

/** BFS minimum moves to clear the board (for level validation). */
export function minMovesToSolve(
  initial: Piece[],
  maxDepth = 64,
): number | null {
  const start = clonePieces(initial);

  if (checkWin(start)) return 0;

  const seen = new Set<string>([stateKey(start)]);
  const queue: { pieces: Piece[]; depth: number }[] = [
    { pieces: start, depth: 0 },
  ];

  while (queue.length > 0) {
    const { pieces, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;

    for (const p of pieces) {
      const { result, updatedPieces } = undoPiece(pieces, p.id);
      if (result !== "success") continue;

      if (checkWin(updatedPieces)) return depth + 1;

      const key = stateKey(updatedPieces);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ pieces: updatedPieces, depth: depth + 1 });
    }
  }

  return null;
}

/**
 * Count distinct winning click sequences (piece-id order matters).
 * Used to prove a level has exactly one valid chronological solution.
 */
export function countWinningClickSequences(
  initial: Piece[],
  maxDepth = 64,
): number {
  const start = clonePieces(initial);
  let count = 0;

  function dfs(pieces: Piece[], depth: number): void {
    if (checkWin(pieces)) {
      count++;
      return;
    }
    if (depth >= maxDepth) return;

    for (const p of pieces) {
      const { result, updatedPieces } = undoPiece(pieces, p.id);
      if (result !== "success") continue;
      dfs(updatedPieces, depth + 1);
    }
  }

  dfs(start, 0);
  return count;
}

/** All winning click sequences (for debugging level design). */
export function listWinningClickSequences(
  initial: Piece[],
  maxDepth = 64,
): string[][] {
  const start = clonePieces(initial);
  const sequences: string[][] = [];

  function dfs(pieces: Piece[], depth: number, clicks: string[]): void {
    if (checkWin(pieces)) {
      sequences.push([...clicks]);
      return;
    }
    if (depth >= maxDepth) return;

    for (const p of pieces) {
      const { result, updatedPieces } = undoPiece(pieces, p.id);
      if (result !== "success") continue;
      dfs(updatedPieces, depth + 1, [...clicks, p.id]);
    }
  }

  dfs(start, 0, []);
  return sequences;
}
