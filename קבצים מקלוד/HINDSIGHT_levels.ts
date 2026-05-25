// ============================================================
// HINDSIGHT — Level Data
// All 15 levels, verified solvable.
//
// UNDO DIRECTION MAP (canonical):
//   dir: "right" → undo moves LEFT  → target = (row, col - 1)
//   dir: "left"  → undo moves RIGHT → target = (row, col + 1)
//   dir: "down"  → undo moves UP    → target = (row - 1, col)
//   dir: "up"    → undo moves DOWN  → target = (row + 1, col)
//
// A piece is BLOCKED if its target cell is occupied by another active piece.
// A piece is REMOVED when its undo succeeds (dir set to null, removed from board).
// WIN when all pieces are removed.
// ============================================================

export type Direction = "up" | "down" | "left" | "right";
export type PieceColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "teal";

export interface Piece {
  id: string;        // single uppercase letter shown on the piece
  color: PieceColor;
  row: number;       // 0-based, 0 = top row
  col: number;       // 0-based, 0 = left column
  dir: Direction;    // direction the piece came FROM (= undo direction)
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  category: "tutorial" | "chain" | "recursive" | "tree" | "parallel" | "bottleneck";
  concept: string;         // educational insight shown on the win screen
  dependency_label: string; // compact notation, e.g. "C → B → A"
  solution_hint: string;   // first move hint (shown after 3 failed attempts)
  pieces: Piece[];
  optimal_moves: number;
}

// ============================================================
// UNDO TARGET HELPER (for reference — implement in gameLogic.ts)
//
// function getUndoTarget(piece: Piece): { row: number; col: number } {
//   switch (piece.dir) {
//     case "right": return { row: piece.row, col: piece.col - 1 };
//     case "left":  return { row: piece.row, col: piece.col + 1 };
//     case "down":  return { row: piece.row - 1, col: piece.col };
//     case "up":    return { row: piece.row + 1, col: piece.col };
//   }
// }
//
// A piece exits the board (and is removed) when its target row < 0,
// row > 3, col < 0, or col > 3.
// ============================================================

export const LEVELS: Level[] = [

  // ── LEVEL 1 ─────────────────────────────────────────────
  // One piece. No dependencies. Pure tutorial.
  // A(1,0,right) → undo: (1,-1) → exits left ✓
  {
    id: 1,
    title: "Wake Up",
    subtitle: "1 piece — Level 1",
    category: "tutorial",
    concept:
      "Every piece shows an arrow — the direction it moved to get here. " +
      "Click it to send it back one step.",
    dependency_label: "A",
    solution_hint: "Click A.",
    pieces: [
      { id: "A", color: "blue", row: 1, col: 0, dir: "right" },
    ],
    optimal_moves: 1,
  },

  // ── LEVEL 2 ─────────────────────────────────────────────
  // Two pieces. B is free; A is blocked by B.
  // B(2,0,right) → (2,-1) exits ✓
  // A(2,1,right) → (2,0) blocked by B
  {
    id: 2,
    title: "First Block",
    subtitle: "2 pieces — Level 2",
    category: "chain",
    concept:
      "A cannot leave until B does. The piece in the way must move first. " +
      "This is the core rule: always clear the path before you move.",
    dependency_label: "B → A",
    solution_hint: "B is in A's path. Start with B.",
    pieces: [
      { id: "B", color: "blue",  row: 2, col: 0, dir: "right" },
      { id: "A", color: "red",   row: 2, col: 1, dir: "right" },
    ],
    optimal_moves: 2,
  },

  // ── LEVEL 3 ─────────────────────────────────────────────
  // Two pieces, vertical axis. Same logic as L2, different direction.
  // B(0,2,down) → (-1,2) exits top ✓
  // A(1,2,down) → (0,2) blocked by B
  {
    id: 3,
    title: "Stack",
    subtitle: "2 pieces — Level 3",
    category: "chain",
    concept:
      "Same rule, different axis. Horizontal or vertical — " +
      "always check what occupies the target cell before acting.",
    dependency_label: "B → A",
    solution_hint: "B is above A and must exit first.",
    pieces: [
      { id: "B", color: "purple", row: 0, col: 2, dir: "down" },
      { id: "A", color: "green",  row: 1, col: 2, dir: "down" },
    ],
    optimal_moves: 2,
  },

  // ── LEVEL 4 ─────────────────────────────────────────────
  // Three pieces in a horizontal chain.
  // C(2,0,right) → exits ✓
  // B(2,1,right) → (2,0) blocked by C
  // A(2,2,right) → (2,1) blocked by B
  {
    id: 4,
    title: "Domino",
    subtitle: "3 pieces — Level 4",
    category: "recursive",
    concept:
      "To undo A, you must first undo B. To undo B, you must first undo C. " +
      "Nested dependencies — like recursive function calls that resolve from the inside out.",
    dependency_label: "C → B → A",
    solution_hint: "C is the only free piece. Start there.",
    pieces: [
      { id: "C", color: "green",  row: 2, col: 0, dir: "right" },
      { id: "B", color: "red",    row: 2, col: 1, dir: "right" },
      { id: "A", color: "blue",   row: 2, col: 2, dir: "right" },
    ],
    optimal_moves: 3,
  },

  // ── LEVEL 5 ─────────────────────────────────────────────
  // Three pieces in an L-shaped chain. Chain bends at B.
  // A(0,0,right) → exits ✓
  // B(0,1,right) → (0,0) blocked by A
  // C(1,1,down)  → (0,1) blocked by B   [dir:down → undo: row-1]
  {
    id: 5,
    title: "Corner",
    subtitle: "3 pieces — Level 5",
    category: "recursive",
    concept:
      "The chain bends. A unlocks B, B unlocks C — but they're not in a straight line. " +
      "Track the dependency, not the direction. The shape doesn't matter; the order does.",
    dependency_label: "A → B → C",
    solution_hint: "A exits left and starts the chain.",
    pieces: [
      { id: "A", color: "blue",   row: 0, col: 0, dir: "right" },
      { id: "B", color: "red",    row: 0, col: 1, dir: "right" },
      { id: "C", color: "green",  row: 1, col: 1, dir: "down" },
    ],
    optimal_moves: 3,
  },

  // ── LEVEL 6 ─────────────────────────────────────────────
  // Four pieces. D is free. B depends on D. A and C both depend on B
  // (both target B's current cell after B clears it).
  // D(2,0,right) → exits ✓
  // B(2,1,right) → (2,0) blocked by D
  // A(2,2,right) → (2,1) blocked by B
  // C(3,1,down)  → (2,1) blocked by B   [dir:down → undo: row-1]
  {
    id: 6,
    title: "Fork",
    subtitle: "4 pieces — Level 6",
    category: "tree",
    concept:
      "Unlocking one piece (B) opens two separate paths at once. " +
      "In dependency graphs, resolving a single node can unblock multiple branches simultaneously.",
    dependency_label: "D → B → {A, C}",
    solution_hint: "D starts the chain. Once B is cleared, two paths open.",
    pieces: [
      { id: "D", color: "teal",   row: 2, col: 0, dir: "right" },
      { id: "B", color: "orange", row: 2, col: 1, dir: "right" },
      { id: "A", color: "red",    row: 2, col: 2, dir: "right" },
      { id: "C", color: "purple", row: 3, col: 1, dir: "down" },
    ],
    optimal_moves: 4,
  },

  // ── LEVEL 7 ─────────────────────────────────────────────
  // Four pieces. Two completely independent parallel chains.
  // C(0,0,right) → exits ✓    A(0,1,right) → (0,0) blocked by C
  // D(3,0,right) → exits ✓    B(3,1,right) → (3,0) blocked by D
  {
    id: 7,
    title: "Twins",
    subtitle: "4 pieces — Level 7",
    category: "parallel",
    concept:
      "Two completely independent chains. Neither waits for the other — " +
      "like two parallel threads in code. You can freely interleave them in any order.",
    dependency_label: "(C → A) ∥ (D → B)",
    solution_hint: "C and D are both free. Either chain can start first.",
    pieces: [
      { id: "C", color: "blue",   row: 0, col: 0, dir: "right" },
      { id: "A", color: "red",    row: 0, col: 1, dir: "right" },
      { id: "D", color: "green",  row: 3, col: 0, dir: "right" },
      { id: "B", color: "purple", row: 3, col: 1, dir: "right" },
    ],
    optimal_moves: 4,
  },

  // ── LEVEL 8 ─────────────────────────────────────────────
  // Four pieces. Single chain of depth 4 — entire row blocked.
  // D(1,0,right) → exits ✓
  // C(1,1,right) → (1,0) blocked by D
  // B(1,2,right) → (1,1) blocked by C
  // A(1,3,right) → (1,2) blocked by B
  {
    id: 8,
    title: "Depth",
    subtitle: "4 pieces — Level 8",
    category: "recursive",
    concept:
      "Four levels deep. One free piece at the start, then a full cascade. " +
      "Each move reveals exactly one new option — pure sequential backward reasoning.",
    dependency_label: "D → C → B → A",
    solution_hint: "D is the only free piece. The chain flows left to right.",
    pieces: [
      { id: "D", color: "teal",   row: 1, col: 0, dir: "right" },
      { id: "C", color: "orange", row: 1, col: 1, dir: "right" },
      { id: "B", color: "red",    row: 1, col: 2, dir: "right" },
      { id: "A", color: "blue",   row: 1, col: 3, dir: "right" },
    ],
    optimal_moves: 4,
  },

  // ── LEVEL 9 ─────────────────────────────────────────────
  // Four pieces. C is free and blocks TWO pieces (A and D) heading
  // toward the same cell. B is fully independent.
  // C(0,3,down)  → (-1,3) exits top ✓      [dir:down → undo: row-1]
  // A(0,2,left)  → (0,3)  blocked by C     [dir:left → undo: col+1]
  // D(1,3,down)  → (0,3)  blocked by C     [dir:down → undo: row-1]
  // B(1,2,up)    → (2,2)  free             [dir:up   → undo: row+1]
  {
    id: 9,
    title: "Crossfire",
    subtitle: "4 pieces — Level 9",
    category: "bottleneck",
    concept:
      "One piece (C) is blocking two others at the same time. " +
      "Identify the shared blocker — remove it once and you solve two problems. " +
      "B is independent: ignore it or do it anytime.",
    dependency_label: "C → {A, D}  ∥  B",
    solution_hint: "C is blocking two paths at once. Start with C.",
    pieces: [
      { id: "C", color: "green",  row: 0, col: 3, dir: "down"  },
      { id: "A", color: "red",    row: 0, col: 2, dir: "left"  },
      { id: "D", color: "purple", row: 1, col: 3, dir: "down"  },
      { id: "B", color: "blue",   row: 1, col: 2, dir: "up"    },
    ],
    optimal_moves: 4,
  },

  // ── LEVEL 10 ────────────────────────────────────────────
  // Four pieces. Chain of 4 that zigzags — changes axis twice.
  // D(0,0,right) → exits ✓
  // C(0,1,right) → (0,0) blocked by D
  // B(1,1,down)  → (0,1) blocked by C    [dir:down → undo: row-1]
  // A(1,0,left)  → (1,1) blocked by B    [dir:left → undo: col+1]
  {
    id: 10,
    title: "Snake",
    subtitle: "4 pieces — Level 10",
    category: "recursive",
    concept:
      "The chain zigzags — horizontal, then vertical, then horizontal again. " +
      "Direction changes, but the logic doesn't: find the one free piece and trace backward.",
    dependency_label: "D → C → B → A",
    solution_hint: "D exits top-left. Follow the path as it bends.",
    pieces: [
      { id: "D", color: "teal",   row: 0, col: 0, dir: "right" },
      { id: "C", color: "orange", row: 0, col: 1, dir: "right" },
      { id: "B", color: "red",    row: 1, col: 1, dir: "down"  },
      { id: "A", color: "blue",   row: 1, col: 0, dir: "left"  },
    ],
    optimal_moves: 4,
  },

  // ── LEVEL 11 ────────────────────────────────────────────
  // Five pieces. Long zigzag chain across 3 rows.
  // E(0,0,right) → exits ✓
  // D(0,1,right) → (0,0) blocked by E
  // C(1,1,down)  → (0,1) blocked by D    [dir:down → undo: row-1]
  // B(1,0,left)  → (1,1) blocked by C    [dir:left → undo: col+1]
  // A(2,0,down)  → (1,0) blocked by B    [dir:down → undo: row-1]
  {
    id: 11,
    title: "Long Snake",
    subtitle: "5 pieces — Level 11",
    category: "recursive",
    concept:
      "Five-step chain through three rows. The path coils — but there is only ever " +
      "one valid next move. This is pure backward induction: start from the end, work to the start.",
    dependency_label: "E → D → C → B → A",
    solution_hint: "E is the only free piece. Follow the coil.",
    pieces: [
      { id: "E", color: "orange", row: 0, col: 0, dir: "right" },
      { id: "D", color: "teal",   row: 0, col: 1, dir: "right" },
      { id: "C", color: "green",  row: 1, col: 1, dir: "down"  },
      { id: "B", color: "red",    row: 1, col: 0, dir: "left"  },
      { id: "A", color: "blue",   row: 2, col: 0, dir: "down"  },
    ],
    optimal_moves: 5,
  },

  // ── LEVEL 12 ────────────────────────────────────────────
  // Five pieces. Chain that ends in a two-way fork.
  // E(1,0,right) → exits ✓
  // D(1,1,right) → (1,0) blocked by E
  // C(1,2,right) → (1,1) blocked by D
  // A(1,3,right) → (1,2) blocked by C
  // B(2,2,down)  → (1,2) blocked by C    [dir:down → undo: row-1]
  {
    id: 12,
    title: "Bottleneck",
    subtitle: "5 pieces — Level 12",
    category: "bottleneck",
    concept:
      "C is a bottleneck: it blocks two separate pieces (A and B) heading to the same cell. " +
      "The first three moves are forced. Only then do you get a choice — and both options are valid.",
    dependency_label: "E → D → C → {A, B}",
    solution_hint: "Start with E — the chain to C is forced.",
    pieces: [
      { id: "E", color: "orange", row: 1, col: 0, dir: "right" },
      { id: "D", color: "teal",   row: 1, col: 1, dir: "right" },
      { id: "C", color: "red",    row: 1, col: 2, dir: "right" },
      { id: "A", color: "blue",   row: 1, col: 3, dir: "right" },
      { id: "B", color: "purple", row: 2, col: 2, dir: "down"  },
    ],
    optimal_moves: 5,
  },

  // ── LEVEL 13 ────────────────────────────────────────────
  // Five pieces. Two parallel independent chains of different lengths.
  // Chain 1 (2 steps): C(0,0,right) → exits,  A(0,1,right) → (0,0)
  // Chain 2 (3 steps): E(3,0,right) → exits,  D(3,1,right) → (3,0),  B(3,2,right) → (3,1)
  {
    id: 13,
    title: "Split Path",
    subtitle: "5 pieces — Level 13",
    category: "parallel",
    concept:
      "Two independent chains of different lengths. " +
      "The short chain (C→A) finishes in 2 moves. The long chain (E→D→B) needs 3. " +
      "Manage both in parallel — switching between them is not only allowed, it's good practice.",
    dependency_label: "(C → A)  ∥  (E → D → B)",
    solution_hint: "C and E are both free. Both chains start independently.",
    pieces: [
      { id: "C", color: "blue",   row: 0, col: 0, dir: "right" },
      { id: "A", color: "red",    row: 0, col: 1, dir: "right" },
      { id: "E", color: "green",  row: 3, col: 0, dir: "right" },
      { id: "D", color: "purple", row: 3, col: 1, dir: "right" },
      { id: "B", color: "orange", row: 3, col: 2, dir: "right" },
    ],
    optimal_moves: 5,
  },

  // ── LEVEL 14 ────────────────────────────────────────────
  // Six pieces. Long chain (4 steps) that ends in a two-way fork.
  // F(2,0,right) → exits ✓
  // E(2,1,right) → (2,0) blocked by F
  // D(2,2,right) → (2,1) blocked by E
  // C(1,2,up)    → (2,2) blocked by D    [dir:up → undo: row+1]
  // A(1,3,right) → (1,2) blocked by C    [dir:right → undo: col-1]
  // B(0,2,up)    → (1,2) blocked by C    [dir:up → undo: row+1]
  {
    id: 14,
    title: "Cascade",
    subtitle: "6 pieces — Level 14",
    category: "tree",
    concept:
      "A long chain (F→E→D→C) feeds a final fork. You must clear the entire chain " +
      "before two pieces become available at once. Patience in sequencing unlocks speed at the end.",
    dependency_label: "F → E → D → C → {A, B}",
    solution_hint: "F starts a chain that bends — follow it to C, then the fork opens.",
    pieces: [
      { id: "F", color: "teal",   row: 2, col: 0, dir: "right" },
      { id: "E", color: "orange", row: 2, col: 1, dir: "right" },
      { id: "D", color: "red",    row: 2, col: 2, dir: "right" },
      { id: "C", color: "green",  row: 1, col: 2, dir: "up"    },
      { id: "A", color: "blue",   row: 1, col: 3, dir: "right" },
      { id: "B", color: "purple", row: 0, col: 2, dir: "up"    },
    ],
    optimal_moves: 6,
  },

  // ── LEVEL 15 ────────────────────────────────────────────
  // Six pieces. One source (F) fans into two chains simultaneously.
  // F(0,0,right) → exits ✓
  // E(0,1,right) → (0,0) blocked by F    [same target as D!]
  // D(1,0,down)  → (0,0) blocked by F    [dir:down → undo: row-1]
  // C(1,1,down)  → (0,1) blocked by E    [dir:down → undo: row-1]
  // B(2,0,down)  → (1,0) blocked by D    [dir:down → undo: row-1]
  // A(2,1,down)  → (1,1) blocked by C    [dir:down → undo: row-1]
  {
    id: 15,
    title: "The Source",
    subtitle: "6 pieces — Level 15",
    category: "tree",
    concept:
      "Everything depends on one piece: F. Remove it, and two full chains unlock at once. " +
      "This is the master pattern — a single-source dependency tree. " +
      "Find the root. Everything else follows.",
    dependency_label: "F → { E → C → A,  D → B }",
    solution_hint: "F is the only free piece — and the key to everything.",
    pieces: [
      { id: "F", color: "teal",   row: 0, col: 0, dir: "right" },
      { id: "E", color: "orange", row: 0, col: 1, dir: "right" },
      { id: "D", color: "red",    row: 1, col: 0, dir: "down"  },
      { id: "C", color: "green",  row: 1, col: 1, dir: "down"  },
      { id: "B", color: "purple", row: 2, col: 0, dir: "down"  },
      { id: "A", color: "blue",   row: 2, col: 1, dir: "down"  },
    ],
    optimal_moves: 6,
  },

];

// ============================================================
// SOLUTION REFERENCE (for internal testing / level editor)
// ============================================================
//
// L1:  [A]
// L2:  [B, A]
// L3:  [B, A]
// L4:  [C, B, A]
// L5:  [A, B, C]
// L6:  [D, B, A|C, C|A]            — A and C interchangeable at the end
// L7:  any interleaving of [C,A] and [D,B]
// L8:  [D, C, B, A]
// L9:  [C, B|A|D, ...]             — C first; then B, A, D in any order
// L10: [D, C, B, A]
// L11: [E, D, C, B, A]
// L12: [E, D, C, A|B, B|A]         — A and B interchangeable at the end
// L13: any interleaving of [C,A] and [E,D,B]
// L14: [F, E, D, C, A|B, B|A]      — A and B interchangeable at the end
// L15: [F, E|D, D|E, C|B, B|C, A]  — after F: E and D free; A must be last
//
// ============================================================
