import { describe, expect, it } from "vitest";
import type { Piece } from "../types";
import { undoPiece } from "./gameLogic";
import { WORLD_1_LEVELS } from "../data/world1Levels";

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

describe("undoPiece", () => {
  it("1. free move — piece moves successfully", () => {
    const pieces = [p("A", 2, 2, ["right", "right", "right"])];
    const { updatedPieces, result, blockerId } = undoPiece(pieces, "A");

    expect(result).toBe("success");
    expect(blockerId).toBeNull();
    expect(updatedPieces).toEqual([p("A", 2, 1, ["right", "right"])]);
    expect(pieces).not.toBe(updatedPieces);
  });

  it('2. blocked move — push impossible, returns "blocked"', () => {
    const pieces = [
      p("B", 2, 1, ["up"]),
      p("A", 2, 2, ["right", "right", "right"]),
    ];
    const { updatedPieces, result, blockerId } = undoPiece(pieces, "A");

    expect(result).toBe("blocked");
    expect(blockerId).toBe("B");
    expect(updatedPieces).toBe(pieces);
  });

  it("3. exit board — target out of bounds, piece removed from array", () => {
    const pieces = [p("A", 1, 0, ["right"])];
    const { updatedPieces, result, blockerId } = undoPiece(pieces, "A");

    expect(result).toBe("success");
    expect(blockerId).toBeNull();
    expect(updatedPieces).toEqual([]);
  });

  it('4a. invalid — piece not found', () => {
    const pieces = [p("A", 1, 0, ["right"])];
    const { updatedPieces, result, blockerId } = undoPiece(pieces, "Z");

    expect(result).toBe("invalid");
    expect(blockerId).toBeNull();
    expect(updatedPieces).toBe(pieces);
  });

  it("4b. invalid — empty undoPath", () => {
    const pieces = [
      {
        id: "A",
        color: "blue" as const,
        row: 1,
        col: 1,
        movesLeft: 0,
        undoPath: [] as ("up" | "down" | "left" | "right")[],
      },
    ];
    const { updatedPieces, result, blockerId } = undoPiece(pieces, "A");

    expect(result).toBe("invalid");
    expect(blockerId).toBeNull();
    expect(updatedPieces).toBe(pieces);
  });

  it("4c. invalid — movesLeft out of sync with undoPath", () => {
    const pieces = [p("A", 2, 2, ["right", "right"])].map((x) => ({
      ...x,
      movesLeft: 99,
    }));
    const { updatedPieces, result } = undoPiece(pieces, "A");

    expect(result).toBe("invalid");
    expect(updatedPieces).toBe(pieces);
  });

  it("5. two-step piece — first in-bounds shifts path and stays on board", () => {
    const pieces = [p("A", 2, 2, ["right", "right"])];
    const { updatedPieces, result } = undoPiece(pieces, "A");

    expect(result).toBe("success");
    expect(updatedPieces).toEqual([p("A", 2, 1, ["right"])]);
  });

  it("6. two-step piece — second undo exits board", () => {
    let pieces: Piece[] = [p("A", 2, 1, ["right", "right"])];
    pieces = undoPiece(pieces, "A").updatedPieces;
    expect(pieces).toEqual([p("A", 2, 0, ["right"])]);

    const { updatedPieces, result } = undoPiece(pieces, "A");
    expect(result).toBe("success");
    expect(updatedPieces).toEqual([]);
  });

  it("7. invalid — OOB while more than one segment remains", () => {
    const pieces = [p("A", 1, 0, ["right", "right"])];
    const { updatedPieces, result } = undoPiece(pieces, "A");

    expect(result).toBe("invalid");
    expect(updatedPieces).toBe(pieces);
  });

  it("8. elastic push — moves blocker and active piece", () => {
    const pieces: Piece[] = [
      p("B", 1, 1, ["down"]),
      { ...p("R", 2, 1, ["down", "down", "down"]), color: "red" as const },
    ];
    const { result, updatedPieces } = undoPiece(pieces, "R");

    expect(result).toBe("success");
    const b = updatedPieces.find((x) => x.id === "B");
    const r = updatedPieces.find((x) => x.id === "R");
    expect(b).toMatchObject({ row: 0, col: 1 });
    expect(r).toMatchObject({ row: 1, col: 1, undoPath: ["down", "down"] });
  });
});

describe("World 1 Level 5", () => {
  const level5 = WORLD_1_LEVELS.find((l) => l.id === 5)!;

  it("Blue cannot undo first (path ends inside board)", () => {
    const pieces = JSON.parse(JSON.stringify(level5.pieces)) as Piece[];
    const { result } = undoPiece(pieces, "B");
    expect(result).toBe("invalid");
  });

  it("Red pushes Blue up, then both can exit", () => {
    let pieces = JSON.parse(JSON.stringify(level5.pieces)) as Piece[];

    let r = undoPiece(pieces, "R");
    expect(r.result).toBe("success");
    pieces = r.updatedPieces;

    let b = undoPiece(pieces, "B");
    expect(b.result).toBe("success");
    pieces = b.updatedPieces;

    r = undoPiece(pieces, "R");
    expect(r.result).toBe("success");
    pieces = r.updatedPieces;

    r = undoPiece(pieces, "R");
    expect(r.result).toBe("success");
    pieces = r.updatedPieces;

    expect(pieces).toHaveLength(0);
  });
});
