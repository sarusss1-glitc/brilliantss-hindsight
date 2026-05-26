import type { Direction, Level, Piece, PieceColor } from "../types";

type RawPiece = {
  id: string;
  color: PieceColor;
  row: number;
  col: number;
  undoPath: Direction[];
};

function piece(raw: RawPiece): Piece {
  return {
    ...raw,
    undoPath: [...raw.undoPath],
    movesLeft: raw.undoPath.length,
  };
}

/** Baseline difficulty curve — stack + elastic push (from design spec). */
export const ADVANCED_LEVELS: Level[] = [
  {
    id: 1,
    title: "The Setup",
    subtitle: "Tutorial — stack, push, exit",
    category: "chain",
    concept:
      "Read each piece's arrow stack. Tap to undo one step at a time. " +
      "Exit only on the last arrow. Push when blocked — if the cell behind is free.",
    dependency_label: "A ↔ B (column)",
    solution_hint:
      "Watch stacks shrink after each valid tap. Red cannot exit on its first ↑ — " +
      "only the final segment may leave the board.",
    pieces: [
      piece({
        id: "A",
        color: "red",
        row: 3,
        col: 1,
        undoPath: ["up", "right", "right", "right"],
      }),
      piece({
        id: "B",
        color: "blue",
        row: 2,
        col: 1,
        undoPath: ["up", "up"],
      }),
    ],
    optimal_moves: 6,
  },
  {
    id: 2,
    title: "Crossroads",
    subtitle: "3 pieces — Level 2",
    category: "tree",
    concept:
      "Paths cross. A push that helps one piece can unblock two others — or trap you if the order is wrong.",
    dependency_label: "C → B → A",
    solution_hint: "Green is the key at the top. Watch who blocks the left column.",
    pieces: [
      // Spec paths; row/col tuned so each stack clears solo (first segment in-bounds).
      piece({
        id: "A",
        color: "red",
        row: 2,
        col: 2,
        undoPath: ["left", "down", "down", "down"],
      }),
      piece({
        id: "B",
        color: "orange",
        row: 2,
        col: 1,
        undoPath: ["left", "left", "left"],
      }),
      piece({
        id: "C",
        color: "green",
        row: 2,
        col: 3,
        undoPath: ["up", "up"],
      }),
    ],
    optimal_moves: 9,
  },
  {
    id: 3,
    title: "Brain Melter",
    subtitle: "4 pieces — Level 3",
    category: "bottleneck",
    concept:
      "Four stacks tangled in the center. You will need several precise pushes — " +
      "reposition blockers without wasting a single segment from anyone's stack.",
    dependency_label: "multi-push untangle",
    solution_hint: "No piece exits on its first tap. Plan pushes before final exits.",
    pieces: [
      piece({
        id: "A",
        color: "red",
        row: 0,
        col: 2,
        undoPath: ["up", "up", "up", "up"],
      }),
      piece({
        id: "B",
        color: "blue",
        row: 2,
        col: 1,
        undoPath: ["right", "right"],
      }),
      piece({
        id: "C",
        color: "green",
        row: 1,
        col: 3,
        undoPath: ["up", "up", "up"],
      }),
      piece({
        id: "D",
        color: "yellow",
        row: 1,
        col: 2,
        undoPath: ["left", "left"],
      }),
    ],
    optimal_moves: 11,
  },
];
