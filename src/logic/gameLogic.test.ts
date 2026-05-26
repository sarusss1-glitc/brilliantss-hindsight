import { describe, expect, it } from "vitest";
import type { Piece } from "../types";
import { ADVANCED_LEVELS } from "../data/advancedLevels";
import { undoPiece, checkWin } from "./gameLogic";
import { minMovesToSolve } from "./levelSolver";
import { canClearSolo } from "./pathValidate";

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

describe("undoPiece — stack rules", () => {
  it("exits only on final segment when OOB", () => {
    const pieces = [p("A", 1, 0, ["right"])];
    const { result, updatedPieces } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    expect(updatedPieces).toEqual([]);
  });

  it("failure A: in-bounds move would empty stack", () => {
    const pieces = [p("A", 2, 2, ["right"])];
    expect(undoPiece(pieces, "A").result).toBe("invalid");
  });

  it("failure B: OOB while stack length > 1", () => {
    const pieces = [p("A", 1, 0, ["right", "right"])];
    expect(undoPiece(pieces, "A").result).toBe("invalid");
  });

  it("shifts stack on in-bounds success", () => {
    const pieces = [p("A", 2, 2, ["right", "right"])];
    const { result, updatedPieces } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    expect(updatedPieces[0]).toMatchObject({
      row: 2,
      col: 1,
      undoPath: ["right"],
    });
  });
});

describe("undoPiece — elastic push", () => {
  it("pushes blocker without consuming its stack", () => {
    const pieces: Piece[] = [
      p("B", 1, 1, ["down"]),
      { ...p("R", 2, 1, ["down", "down", "down"]), color: "red" as const },
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
      p("X", 0, 1, ["down", "down"]),
      p("B", 1, 1, ["down", "down"]),
      { ...p("R", 2, 1, ["down", "down"]), color: "red" as const },
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

  it("rejects red exiting early (failure B)", () => {
    const pieces = level.pieces.map((x) => ({
      ...x,
      undoPath: [...x.undoPath],
      movesLeft: x.undoPath.length,
    }));
    expect(undoPiece(pieces, "A").result).toBe("invalid");
  });

  it("blocks blue push when red cannot be pushed off-board", () => {
    const pieces = level.pieces.map((x) => ({
      ...x,
      undoPath: [...x.undoPath],
      movesLeft: x.undoPath.length,
    }));
    const { result, blockerId } = undoPiece(pieces, "B");
    expect(result).toBe("blocked");
    expect(blockerId).toBe("A");
  });

  it("consumes one stack segment per successful in-bounds move", () => {
    const a = level.pieces.find((x) => x.id === "A")!;
    const solo = [{ ...a, undoPath: ["right", "right", "right"], movesLeft: 3 }];
    const { result, updatedPieces } = undoPiece(solo, "A");
    expect(result).toBe("success");
    expect(updatedPieces[0]!.undoPath).toEqual(["right", "right"]);
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
  });
});

describe("piece solo clearance", () => {
  it("levels 2+ pieces can clear on an empty board", () => {
    for (const level of ADVANCED_LEVELS.filter((l) => l.id > 1)) {
      for (const piece of level.pieces) {
        expect(
          canClearSolo(piece.row, piece.col, piece.undoPath),
          `${level.title} piece ${piece.id}`,
        ).toBe(true);
      }
    }
  });
});

describe("Level 3 — Brain Melter", () => {
  const level = ADVANCED_LEVELS.find((l) => l.id === 3)!;

  it("is solvable with stack + push rules", () => {
    const min = minMovesToSolve(
      level.pieces.map((x) => ({
        ...x,
        undoPath: [...x.undoPath],
        movesLeft: x.undoPath.length,
      })),
    );
    expect(min).not.toBeNull();
    expect(min!).toBeGreaterThanOrEqual(10);
  });
});
