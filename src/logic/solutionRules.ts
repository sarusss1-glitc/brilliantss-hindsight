import type { Piece } from "../types";
import { listWinningClickSequences } from "./levelSolver";

/** Design-spec dependency order for level 2 (Piggyback). */
export function isValidLevel2Sequence(seq: string[]): boolean {
  return (
    seq.length === 6 &&
    seq[0] === "B" &&
    seq[1] === "A" &&
    seq[2] === "A" &&
    seq[3] === "B" &&
    seq[4] === "B" &&
    seq[5] === "B"
  );
}

/** Design-spec dependency order for level 3 (Friendly Fire). */
export function isValidLevel3Sequence(seq: string[]): boolean {
  return (
    seq.length === 10 &&
    seq.slice(0, 3).every((id) => id === "B") &&
    seq.slice(3, 6).every((id) => id === "A") &&
    seq.slice(6).every((id) => id === "C")
  );
}

/** Design-spec dependency order for level 4 (The Knot). */
export function isValidLevel4Sequence(seq: string[]): boolean {
  return (
    seq.length === 7 &&
    seq.slice(0, 2).every((id) => id === "C") &&
    seq.slice(2, 4).every((id) => id === "A") &&
    seq.slice(4).every((id) => id === "B")
  );
}

export function isValidSequenceForLevel(levelId: number, seq: string[]): boolean {
  switch (levelId) {
    case 2:
      return isValidLevel2Sequence(seq);
    case 3:
      return isValidLevel3Sequence(seq);
    case 4:
      return isValidLevel4Sequence(seq);
    default:
      return true;
  }
}

/**
 * Count winning click sequences that obey the level's dependency order.
 * Levels 2–3 use block-order rules from the design spec; other levels use all wins.
 */
export function countValidChronologicalSolutions(
  levelId: number,
  pieces: Piece[],
): number {
  const wins = listWinningClickSequences(pieces);
  if (levelId === 2 || levelId === 3 || levelId === 4) {
    return wins.filter((seq) => isValidSequenceForLevel(levelId, seq)).length;
  }
  return wins.length;
}

/** True when exactly one valid chronological solution exists for this level. */
export function hasUniqueValidSolution(levelId: number, pieces: Piece[]): boolean {
  return countValidChronologicalSolutions(levelId, pieces) === 1;
}

/** Whether the level has exactly one valid chronological solution (plan alias). */
export function canSolve(levelId: number, pieces: Piece[]): boolean {
  return hasUniqueValidSolution(levelId, pieces);
}
