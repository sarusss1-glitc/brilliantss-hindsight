import type { Direction, Level, Piece, PieceColor } from "../types";
import { countUndosToExit } from "./pieceFromLegacy";

/** Piece with an explicit undo path (1+ segments). */
function P(
  id: string,
  color: PieceColor,
  row: number,
  col: number,
  undoPath: Direction[],
): Piece {
  return { id, color, row, col, undoPath, movesLeft: undoPath.length };
}

/** Straight-line path until exit (same direction every segment). */
function straight(
  id: string,
  color: PieceColor,
  row: number,
  col: number,
  dir: Direction,
): Piece {
  const n = countUndosToExit(row, col, dir);
  return P(id, color, row, col, Array.from({ length: n }, () => dir));
}

type LevelDef = Omit<Level, "pieces"> & { pieces: Piece[] };

const WORLD_1: LevelDef[] = [
  {
    id: 1,
    title: "Wake Up",
    subtitle: "1 piece — Level 1",
    category: "tutorial",
    concept:
      "Each arrow shows how the piece arrived. Tap to undo one step along that path.",
    dependency_label: "A",
    solution_hint: "Tap A.",
    pieces: [straight("A", "blue", 1, 0, "right")],
    optimal_moves: 1,
  },
  {
    id: 2,
    title: "First Block",
    subtitle: "2 pieces — Level 2",
    category: "chain",
    concept:
      "One piece blocks another. Clear the blocker first — order matters.",
    dependency_label: "B → A",
    solution_hint: "B is in A's way. Start with B.",
    pieces: [
      straight("B", "blue", 2, 0, "right"),
      straight("A", "red", 2, 1, "right"),
    ],
    optimal_moves: 2,
  },
  {
    id: 3,
    title: "Stack",
    subtitle: "2 pieces — Level 3",
    category: "chain",
    concept: "Same rule on a vertical line — check the cell you are moving into.",
    dependency_label: "B → A",
    solution_hint: "B must exit before A.",
    pieces: [
      straight("B", "purple", 0, 2, "down"),
      straight("A", "green", 1, 2, "down"),
    ],
    optimal_moves: 2,
  },
  {
    id: 4,
    title: "Domino",
    subtitle: "3 pieces — Level 4",
    category: "recursive",
    concept:
      "A chain of three — undo from the free end inward, like nested dependencies.",
    dependency_label: "C → B → A",
    solution_hint: "C is the only free piece.",
    pieces: [
      straight("C", "green", 2, 0, "right"),
      straight("B", "red", 2, 1, "right"),
      straight("A", "blue", 2, 2, "right"),
    ],
    optimal_moves: 3,
  },
  {
    id: 5,
    title: "Elastic Push",
    subtitle: "2 pieces — Level 5",
    category: "chain",
    concept:
      "Blue cannot undo yet — its path would end inside the board. Red moves up and pushes Blue up; then both can exit.",
    dependency_label: "R pushes B → both exit",
    solution_hint: "Red must move first (up). That pushes Blue up.",
    pieces: [
      P("B", "blue", 1, 1, ["down"]),
      P("R", "red", 2, 1, ["down", "down", "down"]),
    ],
    optimal_moves: 4,
  },
  {
    id: 6,
    title: "Fork",
    subtitle: "4 pieces — Level 6",
    category: "tree",
    concept:
      "Freeing one piece opens two branches. Sometimes a push clears the way.",
    dependency_label: "D → B → {A, C}",
    solution_hint: "D starts the chain.",
    pieces: [
      straight("D", "teal", 2, 0, "right"),
      straight("B", "orange", 2, 1, "right"),
      straight("A", "red", 2, 2, "right"),
      straight("C", "purple", 3, 1, "down"),
    ],
    optimal_moves: 4,
  },
  {
    id: 7,
    title: "Twins",
    subtitle: "4 pieces — Level 7",
    category: "parallel",
    concept:
      "Two independent chains — you may interleave them in any order.",
    dependency_label: "(C → A) ∥ (D → B)",
    solution_hint: "C and D are both free.",
    pieces: [
      straight("C", "blue", 0, 0, "right"),
      straight("A", "red", 0, 1, "right"),
      straight("D", "green", 3, 0, "right"),
      straight("B", "purple", 3, 1, "right"),
    ],
    optimal_moves: 4,
  },
  {
    id: 8,
    title: "Depth",
    subtitle: "4 pieces — Level 8",
    category: "recursive",
    concept: "Four deep — each undo reveals exactly one new option.",
    dependency_label: "D → C → B → A",
    solution_hint: "D is the only free piece.",
    pieces: [
      straight("D", "teal", 1, 0, "right"),
      straight("C", "orange", 1, 1, "right"),
      straight("B", "red", 1, 2, "right"),
      straight("A", "blue", 1, 3, "right"),
    ],
    optimal_moves: 4,
  },
  {
    id: 9,
    title: "Crossfire",
    subtitle: "4 pieces — Level 9",
    category: "bottleneck",
    concept:
      "One piece blocks two paths. A push can reposition several plans at once.",
    dependency_label: "C → {A, D}  ∥  B",
    solution_hint: "Start with C.",
    pieces: [
      straight("C", "green", 0, 3, "down"),
      straight("A", "red", 0, 2, "left"),
      straight("D", "purple", 1, 3, "down"),
      straight("B", "blue", 1, 2, "up"),
    ],
    optimal_moves: 4,
  },
  {
    id: 10,
    title: "Snake",
    subtitle: "4 pieces — Level 10",
    category: "recursive",
    concept:
      "The chain bends — track dependencies, not the shape on the board.",
    dependency_label: "D → C → B → A",
    solution_hint: "D exits top-left; follow the bend.",
    pieces: [
      straight("D", "teal", 0, 0, "right"),
      straight("C", "orange", 0, 1, "right"),
      straight("B", "red", 1, 1, "down"),
      straight("A", "blue", 1, 0, "left"),
    ],
    optimal_moves: 4,
  },
];

export const WORLD_1_LEVELS: Level[] = WORLD_1.map((level) => ({
  ...level,
  pieces: level.pieces.map((p) => ({ ...p, undoPath: [...p.undoPath] })),
}));
