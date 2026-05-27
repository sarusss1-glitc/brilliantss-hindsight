import { describe, expect, it } from "vitest";
import type { Piece } from "../types";
import { ADVANCED_LEVELS, CANONICAL_SOLUTIONS } from "../data/advancedLevels";
import { undoPiece, checkWin } from "./gameLogic";
import { minMovesToSolve } from "./levelSolver";
import { listWinningClickSequences } from "./levelSolver";
import { canClearSolo } from "./pathValidate";
import {
  canSolve,
  countValidChronologicalSolutions,
  hasUniqueValidSolution,
  isValidLevel2Sequence,
  isValidLevel3Sequence,
  isValidLevel4Sequence,
} from "./solutionRules";

const p = (
  id: string,
  row: number,
  col: number,
  path: Array<"up" | "down" | "left" | "right">,
) => ({
  id,
  color: "blue" as const,
  row,
  col,
  movesLeft: path.length,
  undoPath: path,
});

function cloneLevelPieces(levelId: number): Piece[] {
  const level = ADVANCED_LEVELS.find((l) => l.id === levelId)!;
  return level.pieces.map((x) => ({
    ...x,
    undoPath: [...x.undoPath],
    movesLeft: x.undoPath.length,
  }));
}

function playSequence(pieces: Piece[], clicks: string[]): boolean {
  let state = pieces;
  for (const id of clicks) {
    const { result, updatedPieces } = undoPiece(state, id);
    if (result !== "success") return false;
    state = updatedPieces;
  }
  return checkWin(state);
}

function firstClickPreventsWin(pieces: Piece[], pieceId: string): boolean {
  const { result, updatedPieces } = undoPiece(pieces, pieceId);
  if (result !== "success") return true;
  return minMovesToSolve(updatedPieces) === null;
}

describe("undoPiece — stack rules", () => {
  it("exits only on final segment when OOB", () => {
    const pieces = [p("A", 1, 0, ["left"])];
    const { result, updatedPieces } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    expect(updatedPieces).toEqual([]);
  });

  it("failure A: in-bounds move would empty stack", () => {
    const pieces = [p("A", 2, 2, ["right"])];
    expect(undoPiece(pieces, "A").result).toBe("invalid");
  });

  it("failure B: OOB while stack length > 1", () => {
    const pieces = [p("A", 1, 0, ["left", "left"])];
    expect(undoPiece(pieces, "A").result).toBe("invalid");
  });

  it("shifts stack on in-bounds success", () => {
    const pieces = [p("A", 2, 2, ["right", "right"])];
    const { result, updatedPieces } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    expect(updatedPieces[0]).toMatchObject({
      row: 2,
      col: 3,
      undoPath: ["right"],
    });
  });
});

describe("undoPiece — elastic push", () => {
  it("pushes blocker without consuming its stack", () => {
    const pieces: Piece[] = [
      p("B", 1, 1, ["up"]),
      { ...p("R", 2, 1, ["up", "up", "up"]), color: "red" as const },
    ];
    const before = pieces.find((x) => x.id === "B")!.undoPath.length;
    const { result, updatedPieces } = undoPiece(pieces, "R");
    expect(result).toBe("success");
    const b = updatedPieces.find((x) => x.id === "B")!;
    expect(b.row).toBe(0);
    expect(b.undoPath.length).toBe(before);
  });

  it("blocked when push landing is occupied", () => {
    const pieces: Piece[] = [
      p("X", 0, 1, ["up", "up"]),
      p("B", 1, 1, ["up", "up"]),
      { ...p("R", 2, 1, ["up", "up"]), color: "red" as const },
    ];
    const { result, blockerId } = undoPiece(pieces, "R");
    expect(result).toBe("blocked");
    expect(blockerId).toBe("B");
  });
});

describe("The Setup (level 1)", () => {
  const level = ADVANCED_LEVELS.find((l) => l.id === 1)!;

  it("loads exact tutorial pieces and paths", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    const b = level.pieces.find((x) => x.id === "B")!;
    expect(level.title).toBe("The Setup");
    expect(a).toMatchObject({ row: 3, col: 1, undoPath: ["up", "right", "right", "right"] });
    expect(b).toMatchObject({ row: 2, col: 1, undoPath: ["up", "up"] });
  });

  it("allows red to push blue", () => {
    const pieces = level.pieces.map((x) => ({
      ...x,
      undoPath: [...x.undoPath],
      movesLeft: x.undoPath.length,
    }));
    const { result, updatedPieces } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    const b = updatedPieces.find((x) => x.id === "B")!;
    expect(b.row).toBe(1);
  });
});

describe("Advanced levels — solvable", () => {
  it.each(
    ADVANCED_LEVELS.filter((l) => l.id > 1).map((l) => [l.id, l.title, l.pieces] as const),
  )("level %i (%s) is solvable", (id, _title, pieces) => {
    const min = minMovesToSolve(
      pieces.map((x) => ({
        ...x,
        undoPath: [...x.undoPath],
        movesLeft: x.undoPath.length,
      })),
    );
    expect(min, `level ${id} unsolvable`).not.toBeNull();
    expect(min).toBe(ADVANCED_LEVELS.find((l) => l.id === id)!.optimal_moves);
  });
});

describe("Level 2 — The Piggyback (exact design)", () => {
  const level = ADVANCED_LEVELS.find((l) => l.id === 2)!;

  it("matches plan positions and paths", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    const b = level.pieces.find((x) => x.id === "B")!;
    expect(a).toMatchObject({ row: 2, col: 1, undoPath: ["up", "up"] });
    expect(b).toMatchObject({
      row: 3,
      col: 1,
      undoPath: ["up", "right", "right", "right"],
    });
  });

  it("red cannot clear solo on an empty board", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    expect(canClearSolo(a.row, a.col, a.undoPath)).toBe(false);
  });

  it("clicking red first cannot lead to a win", () => {
    const pieces = cloneLevelPieces(2);
    expect(firstClickPreventsWin(pieces, "A")).toBe(true);
  });

  it("has exactly one valid chronological solution (dependency order)", () => {
    const pieces = cloneLevelPieces(2);
    expect(hasUniqueValidSolution(2, pieces)).toBe(true);
    expect(countValidChronologicalSolutions(2, pieces)).toBe(1);
  });

  it("canonical sequence wins and is the only valid order", () => {
    const pieces = cloneLevelPieces(2);
    const canonical = CANONICAL_SOLUTIONS[2]!;
    expect(playSequence(pieces, canonical)).toBe(true);
    expect(isValidLevel2Sequence(canonical)).toBe(true);
    const wins = listWinningClickSequences(pieces);
    expect(wins.filter(isValidLevel2Sequence)).toHaveLength(1);
    expect(wins.filter(isValidLevel2Sequence)[0]).toEqual(canonical);
  });
});

describe("Level 3 — Friendly Fire (exact design)", () => {
  const level = ADVANCED_LEVELS.find((l) => l.id === 3)!;

  it("matches plan positions and paths", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    const b = level.pieces.find((x) => x.id === "B")!;
    const c = level.pieces.find((x) => x.id === "C")!;
    expect(a).toMatchObject({ row: 2, col: 1, undoPath: ["right", "right", "right"] });
    expect(b).toMatchObject({ row: 2, col: 2, undoPath: ["up", "up", "up"] });
    expect(c).toMatchObject({
      row: 0,
      col: 3,
      undoPath: ["down", "down", "down", "down"],
    });
  });

  it("clicking green first cannot lead to a win", () => {
    const pieces = cloneLevelPieces(3);
    expect(firstClickPreventsWin(pieces, "A")).toBe(true);
  });

  it("has exactly one valid chronological solution (dependency order)", () => {
    const pieces = cloneLevelPieces(3);
    expect(hasUniqueValidSolution(3, pieces)).toBe(true);
    expect(countValidChronologicalSolutions(3, pieces)).toBe(1);
  });

  it("canonical sequence wins and is the only valid order", () => {
    const pieces = cloneLevelPieces(3);
    const canonical = CANONICAL_SOLUTIONS[3]!;
    expect(playSequence(pieces, canonical)).toBe(true);
    expect(isValidLevel3Sequence(canonical)).toBe(true);
    const wins = listWinningClickSequences(pieces);
    expect(wins.filter(isValidLevel3Sequence)).toHaveLength(1);
    expect(wins.filter(isValidLevel3Sequence)[0]).toEqual(canonical);
  });
});

describe("Level 4 — The Knot (exact design)", () => {
  const level = ADVANCED_LEVELS.find((l) => l.id === 4)!;

  it("matches plan positions and paths", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    const b = level.pieces.find((x) => x.id === "B")!;
    const c = level.pieces.find((x) => x.id === "C")!;
    expect(a).toMatchObject({ row: 1, col: 1, undoPath: ["up", "up"] });
    expect(b).toMatchObject({
      row: 2,
      col: 1,
      undoPath: ["right", "right", "right"],
    });
    expect(c).toMatchObject({ row: 2, col: 2, undoPath: ["down", "down"] });
  });

  it("has exactly one valid chronological solution (dependency order)", () => {
    const pieces = cloneLevelPieces(4);
    expect(hasUniqueValidSolution(4, pieces)).toBe(true);
    expect(countValidChronologicalSolutions(4, pieces)).toBe(1);
  });

  it("canonical sequence wins and is the only valid order", () => {
    const pieces = cloneLevelPieces(4);
    const canonical = CANONICAL_SOLUTIONS[4]!;
    expect(playSequence(pieces, canonical)).toBe(true);
    expect(isValidLevel4Sequence(canonical)).toBe(true);
    const wins = listWinningClickSequences(pieces);
    expect(wins.filter(isValidLevel4Sequence)).toHaveLength(1);
    expect(wins.filter(isValidLevel4Sequence)[0]).toEqual(canonical);
  });
});

/** Alias requested in the implementation plan. */
describe("canSolve — unique chronological solution", () => {
  it.each([2, 3, 4] as const)(
    "level %i has exactly one valid click order",
    (levelId) => {
      const pieces = cloneLevelPieces(levelId);
      expect(canSolve(levelId, pieces)).toBe(true);
    },
  );
});
