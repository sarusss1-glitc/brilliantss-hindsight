# REWIND ⏪ — Game Design Document
**Version 1.0**

---

## 1. Overview

**REWIND** is a logic puzzle game on a 4×4 grid. In each level, colored pieces have already been moved to their current positions. The player's task: undo all moves in the correct order — from last to first — until the board is empty.

**Core educational insight:** Some problems can't be solved forward. You must think from the goal backward. This is a foundational skill in programming, chess, project planning, and systems thinking.

---

## 2. Core Mechanics

### What the player sees
Each piece displays an arrow — the direction it came from. The arrow means: "this is how you can undo me."

### What the player can do
Tap/click a piece to move it one step in its arrow direction (undoing its last move).

### When a move is blocked
The target cell is occupied by another piece. The solution: undo the blocking piece first. Blocked attempts trigger a shake animation + highlight on the blocker.

### Win condition
All pieces have been moved off the board (returned to their origin, which is outside the grid). A piece disappears when successfully undone.

### Move counter
Counted and displayed. Not limiting. No "moves remaining."

---

## 3. Level Categories

| Category | Concept | Description |
|---|---|---|
| `chain` | Linear dependency | B blocks A — must solve B first |
| `recursive` | Nested dependency | C→B→A — like nested function calls |
| `tree` | Dependency tree | C,D→B→A — multiple branches converge |
| `parallel` | Partial order | Two independent chains, can interleave |
| `reorder` | Counterintuitive order | Intuition is wrong — correct order is reversed |
| `bottleneck` | Single blocker | One piece blocks everything — must identify it |

---

## 4. Level Data Schema

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';

interface Piece {
  id: string;           // single letter: A, B, C...
  color: string;        // 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'teal'
  row: number;          // 0-based, 0 = top
  col: number;          // 0-based, 0 = left
  dir: Direction;       // direction the piece came FROM (= undo direction)
}

interface Level {
  id: number;
  title: string;
  subtitle: string;     // e.g. "2 pieces — Level 1"
  category: string;
  concept: string;      // educational insight shown on win screen
  dependency_label: string; // e.g. "B → A" shown as diagram
  pieces: Piece[];
  optimal_moves: number;
}
```

### Example level (JSON)
```json
{
  "id": 3,
  "title": "Dependency Tree",
  "subtitle": "4 pieces — Level 3",
  "category": "tree",
  "concept": "Two branches (C and D) must be resolved before B can move. Like resolving imports before running a module.",
  "dependency_label": "C, D → B → A",
  "pieces": [
    { "id": "A", "color": "blue",   "row": 2, "col": 2, "dir": "right" },
    { "id": "B", "color": "red",    "row": 2, "col": 1, "dir": "down"  },
    { "id": "C", "color": "green",  "row": 1, "col": 1, "dir": "right" },
    { "id": "D", "color": "purple", "row": 1, "col": 3, "dir": "down"  }
  ],
  "optimal_moves": 4
}
```

---

## 5. Undo Logic

```
undo(piece):
  target_cell = piece.position + UNDO_VECTOR[piece.dir]

  UNDO_VECTOR = {
    right: (row:  0, col: -1),
    left:  (row:  0, col: +1),
    up:    (row: +1, col:  0),
    down:  (row: -1, col:  0),
  }

  if target_cell is out of bounds:
    → blocked: shake animation on piece

  if target_cell is occupied by another piece:
    → blocked: shake animation + brief highlight on the blocker

  else:
    → move piece to target_cell
    → if target_cell is outside grid bounds: remove piece from board
    → piece.dir = null
    → increment move counter
    → check win condition
```

**Design decision (v1):** When a piece is successfully undone, it **disappears** from the board. No return-to-origin animation. Simpler, same feel.

---

## 6. Application State

```typescript
interface GameState {
  screen: 'intro' | 'map' | 'game' | 'win';
  currentLevelId: number;
  pieces: Piece[];
  moves: number;
  won: boolean;
  completedLevels: number[]; // persisted to localStorage
}
```

---

## 7. Screens

| Screen | Content |
|---|---|
| `intro` | Logo, one-line explanation, Start button |
| `map` | 15 levels as nodes on a path — locked / open / completed |
| `game` | 4×4 grid + move counter + reset button |
| `win` | Educational insight + move count + star rating + Next Level button |

### Star rating (win screen)
| Moves | Stars |
|---|---|
| ≤ optimal | ⭐⭐⭐ |
| optimal + 1–2 | ⭐⭐ |
| optimal + 3+ | ⭐ |

---

## 8. Piece Colors

| Name | Hex |
|---|---|
| red | #E53935 |
| blue | #1E88E5 |
| green | #43A047 |
| purple | #8E24AA |
| orange | #FB8C00 |
| teal | #00897B |

---

## 9. Tech Stack (Web v1)

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **State:** useState / useReducer (no external library needed)
- **Persistence:** localStorage (completed levels + stars)
- **Animations:** CSS transitions (transform, opacity) — no animation library
- **Build:** Vite

---

## 10. File Structure

```
src/
├── data/
│   └── levels.ts          ← all 15 levels as typed array
├── types/
│   └── index.ts           ← Piece, Level, GameState interfaces
├── store/
│   └── useGameStore.ts    ← useReducer + localStorage sync
├── logic/
│   └── gameLogic.ts       ← undo(), checkWin(), isBlocked()
├── components/
│   ├── Board.tsx           ← 4×4 grid
│   ├── Piece.tsx           ← single piece with arrow + animations
│   ├── HUD.tsx             ← move counter + reset button
│   ├── WinScreen.tsx       ← insight + stars + next level
│   ├── LevelMap.tsx        ← 15-node progress map
│   └── IntroScreen.tsx
└── App.tsx
```

---

## Next Step

→ **Level Design:** Build all 15 levels as a complete `levels.ts` file, progressively ordered, with correct dependencies and verified solvability.
