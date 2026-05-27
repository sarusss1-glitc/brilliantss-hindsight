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
    title: "The Piggyback",
    subtitle: "Required repositioning",
    category: "chain",
    concept:
      "Red cannot clear the board alone — its stack is too short from this lane. " +
      "Blue must move first and reposition Red before Red can finish escaping.",
    dependency_label: "B → A → B",
    solution_hint: "Blue moves first. Red must complete both arrows before Blue turns right.",
    pieces: [
      piece({
        id: "A",
        color: "red",
        row: 2,
        col: 1,
        undoPath: ["up", "up"],
      }),
      piece({
        id: "B",
        color: "blue",
        row: 3,
        col: 1,
        undoPath: ["up", "right", "right", "right"],
      }),
    ],
    optimal_moves: 6,
  },
  {
    id: 3,
    title: "Friendly Fire",
    subtitle: "Order of operations",
    category: "tree",
    concept:
      "Green points right into Yellow. If Green moves first, the push ruins Yellow's escape. " +
      "Yellow must clear before Green — the purple blocker at the top corner is the trap.",
    dependency_label: "B → A → C",
    solution_hint: "Yellow exits upward first. Never let Green shove Yellow into the corner.",
    pieces: [
      piece({
        id: "A",
        color: "green",
        row: 2,
        col: 1,
        undoPath: ["right", "right", "right"],
      }),
      piece({
        id: "B",
        color: "yellow",
        row: 2,
        col: 2,
        undoPath: ["up", "up", "up"],
      }),
      piece({
        id: "C",
        color: "purple",
        row: 0,
        col: 3,
        undoPath: ["down", "down", "down", "down"],
      }),
    ],
    optimal_moves: 10,
  },
  {
    id: 4,
    title: "The Knot",
    subtitle: "Multi-step untangling",
    category: "bottleneck",
    concept:
      "Three pieces gridlocked in a 3×3 knot. No piece can exit on the first tap — " +
      "calculate pushes several steps ahead before anyone leaves the board.",
    dependency_label: "B → A → C",
    solution_hint:
      "Teal moves down first to open the knot. Then Red, then Blue to the right.",
    pieces: [
      piece({
        id: "A",
        color: "red",
        row: 1,
        col: 1,
        undoPath: ["up", "up"],
      }),
      piece({
        id: "B",
        color: "blue",
        row: 2,
        col: 1,
        undoPath: ["right", "right", "right"],
      }),
      piece({
        id: "C",
        color: "teal",
        row: 2,
        col: 2,
        undoPath: ["down", "down"],
      }),
    ],
    optimal_moves: 7,
  },
];

/** Canonical winning click order per level (for tests and hints). */
export const CANONICAL_SOLUTIONS: Record<number, string[]> = {
  2: ["B", "A", "A", "B", "B", "B"],
  3: ["B", "B", "B", "A", "A", "A", "C", "C", "C", "C"],
  4: ["C", "C", "A", "A", "B", "B", "B"],
};
