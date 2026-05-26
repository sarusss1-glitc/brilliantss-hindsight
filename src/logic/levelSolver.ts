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

/** BFS minimum moves to clear the board (for level validation). */
export function minMovesToSolve(
  initial: Piece[],
  maxDepth = 64,
): number | null {
  const start = initial.map((p) => ({
    ...p,
    undoPath: [...p.undoPath],
    movesLeft: p.undoPath.length,
  }));

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
