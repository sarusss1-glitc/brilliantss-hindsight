export type Direction = "up" | "down" | "left" | "right";

export type PieceColor =
  | "red" | "blue" | "green" | "purple" | "orange" | "teal" | "yellow";

export type Category =
  | "tutorial" | "chain" | "recursive" | "tree" | "parallel" | "bottleneck";

export type Screen = "intro" | "map" | "game" | "win";

export interface Piece {
  id: string;
  color: PieceColor;
  row: number; // 0-based, 0 = top row
  col: number; // 0-based, 0 = left column
  movesLeft: number;
  /** Current undo direction is always `undoPath[0]`. */
  undoPath: Direction[];
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  category: Category;
  concept: string;
  dependency_label: string;
  solution_hint: string;
  pieces: Piece[];
  optimal_moves: number;
}

export interface GameState {
  screen: Screen;
  currentLevelId: number;
  pieces: Piece[];
  moves: number;
  won: boolean;
  completedLevels: Record<number, number>; // levelId → star count (1–3)
}

export type GameAction =
  | { type: "UNDO_PIECE"; pieceId: string }
  | { type: "RESET_LEVEL" }
  | { type: "GO_TO_LEVEL"; levelId: number }
  | { type: "GO_TO_MAP" }
  | { type: "GO_TO_INTRO" }
  | { type: "NEXT_LEVEL" };
