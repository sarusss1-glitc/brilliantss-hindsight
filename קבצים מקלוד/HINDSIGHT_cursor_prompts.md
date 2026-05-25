# HINDSIGHT — Cursor Prompt Sequence
**Use these prompts in order. Each one builds on the previous.**
**Before each prompt: attach the relevant files as context (noted per step).**

---

## HOW TO USE THIS DOCUMENT

1. Open Cursor
2. For each step: attach the files listed under **"Attach to context"**
3. Paste the prompt exactly
4. Review the output before moving to the next step
5. If something is wrong, correct it before proceeding — later steps depend on earlier ones

---

## STEP 1 — Project Scaffold

**Attach to context:** `HINDSIGHT_GDD.md`

**Prompt:**
```
Scaffold a new project called HINDSIGHT with the following stack:
- Vite + React + TypeScript
- Tailwind CSS (v3)
- No external state management libraries
- No animation libraries (CSS transitions only)

Create the following file structure exactly:

src/
├── data/
│   └── levels.ts
├── types/
│   └── index.ts
├── store/
│   └── useGameStore.ts
├── logic/
│   └── gameLogic.ts
├── components/
│   ├── Board.tsx
│   ├── Piece.tsx
│   ├── HUD.tsx
│   ├── WinScreen.tsx
│   ├── LevelMap.tsx
│   └── IntroScreen.tsx
└── App.tsx

Leave all files empty except for a single comment: // TODO
Do not write any logic yet. Only scaffold the structure.
Configure tailwind.config.ts to include the src/ directory.
Set up index.css with Tailwind base directives.
```

---

## STEP 2 — Types

**Attach to context:** `HINDSIGHT_GDD.md`

**Prompt:**
```
Fill in src/types/index.ts with the following TypeScript interfaces.
Copy them exactly — do not add, remove, or rename any field.

export type Direction = "up" | "down" | "left" | "right";

export type PieceColor =
  | "red" | "blue" | "green" | "purple" | "orange" | "teal";

export type Category =
  | "tutorial" | "chain" | "recursive" | "tree" | "parallel" | "bottleneck";

export type Screen = "intro" | "map" | "game" | "win";

export interface Piece {
  id: string;
  color: PieceColor;
  row: number;        // 0-based, 0 = top row
  col: number;        // 0-based, 0 = left column
  dir: Direction | null;  // null = piece has been removed from board
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
```

---

## STEP 3 — Level Data

**Attach to context:** `HINDSIGHT_levels.ts`

**Prompt:**
```
Copy the contents of the attached HINDSIGHT_levels.ts file into src/data/levels.ts exactly.
Change the import path for types to use: import type { Level } from "../types";
Remove the inline type definitions at the top of the file (Direction, PieceColor, Piece, Level)
since they are now imported from ../types.
Keep all comments, especially the SOLUTION REFERENCE block at the bottom.
Do not modify any level data.
```

---

## STEP 4 — Game Logic

**Attach to context:** `HINDSIGHT_GDD.md`, `src/types/index.ts`

**Prompt:**
```
Implement src/logic/gameLogic.ts with the following functions.
Import all types from "../types". Do not use any external libraries.

GRID SIZE is 4×4 (rows 0–3, cols 0–3).

--- 

function getUndoTarget(piece: Piece): { row: number; col: number }
  Returns the cell the piece would move to if undone.
  UNDO_VECTOR:
    "right" → (row, col - 1)
    "left"  → (row, col + 1)
    "down"  → (row - 1, col)
    "up"    → (row + 1, col)

---

function isOutOfBounds(row: number, col: number): boolean
  Returns true if row < 0 || row > 3 || col < 0 || col > 3

---

function getBlocker(pieces: Piece[], target: { row: number; col: number }, movingId: string): Piece | null
  Returns the piece occupying the target cell (excluding the piece with movingId).
  Returns null if the cell is empty or out of bounds.

---

function undoPiece(pieces: Piece[], pieceId: string): {
  updatedPieces: Piece[];
  result: "success" | "blocked" | "invalid";
  blockerId: string | null;
}
  Attempts to undo the piece with the given id.
  - If piece not found or dir is null: return { result: "invalid", blockerId: null, updatedPieces: pieces }
  - Compute target via getUndoTarget
  - If target is out of bounds: remove piece from the array (it exits the board). Return result: "success"
  - If target is occupied: return { result: "blocked", blockerId: <id of blocker> }
  - Otherwise: move piece to target, set piece.dir = null. Return result: "success"

---

function checkWin(pieces: Piece[]): boolean
  Returns true if pieces array is empty (all pieces removed).

---

function calculateStars(moves: number, optimal: number): number
  Returns 3 if moves <= optimal
  Returns 2 if moves <= optimal + 2
  Returns 1 otherwise

---

Export all five functions.
```

---

## STEP 5 — State Management

**Attach to context:** `src/types/index.ts`, `src/logic/gameLogic.ts`, `src/data/levels.ts`

**Prompt:**
```
Implement src/store/useGameStore.ts as a custom React hook using useReducer.

Import types from "../types", logic from "../logic/gameLogic", levels from "../data/levels".

INITIAL STATE:
- Load completedLevels from localStorage key "hindsight_progress" (parse JSON, default to {})
- screen: "intro"
- currentLevelId: 1
- pieces: [] 
- moves: 0
- won: false

REDUCER — handle these actions:

GO_TO_LEVEL (levelId):
  - Find level in LEVELS array
  - Set screen: "game"
  - Set currentLevelId to levelId
  - Deep-copy level.pieces (use JSON.parse/JSON.stringify)
  - Reset moves: 0, won: false

UNDO_PIECE (pieceId):
  - If state.won: return unchanged state
  - Call undoPiece(state.pieces, pieceId)
  - If result === "blocked" or "invalid": return unchanged state
    (UI handles shake animation separately via a local state in the component)
  - If result === "success":
    - Increment moves
    - Check win: if checkWin(updatedPieces):
      - Set won: true, screen: "win"
      - Calculate stars via calculateStars(moves + 1, currentLevel.optimal_moves)
      - Update completedLevels, persist to localStorage
    - Return updated pieces

RESET_LEVEL:
  - Re-dispatch GO_TO_LEVEL with currentLevelId

NEXT_LEVEL:
  - If currentLevelId < 15: GO_TO_LEVEL(currentLevelId + 1)
  - Else: GO_TO_MAP

GO_TO_MAP:
  - Set screen: "map"

GO_TO_INTRO:
  - Set screen: "intro"

HOOK RETURN:
  Return { state, dispatch } — nothing else.
```

---

## STEP 6 — Board & Piece Components

**Attach to context:** `src/types/index.ts`, `HINDSIGHT_GDD.md` (visual identity section)

**Prompt:**
```
Implement src/components/Piece.tsx and src/components/Board.tsx.

--- Piece.tsx ---

Props:
  piece: Piece
  onUndo: (id: string) => void
  isShaking: boolean
  isHighlighted: boolean   // true when this piece is the identified blocker

Behavior:
- If piece.dir is null: render nothing (piece is removed)
- Display a colored square (the piece's color from this palette):
    red: #E53935, blue: #1E88E5, green: #43A047
    purple: #8E24AA, orange: #FB8C00, teal: #00897B
- Display a large white arrow in the center matching piece.dir
- On click: call onUndo(piece.id)
- isShaking: add a CSS shake animation (translateX keyframes, 0.3s)
- isHighlighted: add a bright pulsing border (white, 0.4s pulse)
- CSS transition on position: 0.2s ease (for smooth moves)
- Cursor: pointer

--- Board.tsx ---

Props:
  pieces: Piece[]
  onUndo: (id: string) => void

Local state:
  shakingId: string | null    — clears after 400ms
  highlightedId: string | null — clears after 600ms

Logic:
  When onUndo is called:
    - Import undoPiece from gameLogic (read-only check — do not modify state here)
    - Actually dispatch through the parent's onUndo prop
    - But ALSO locally check: if the move would be blocked, set shakingId to the moving piece
      and highlightedId to the blocker
    Note: Board needs access to current pieces to do this local check.
    Pass a getBlockerForPiece helper or do the check inline.

Layout:
  - 4×4 grid of cells
  - Grid size: responsive, max 320px, square
  - Each cell: rounded, dark background (#1C2B3A)
  - Pieces positioned absolutely within the grid using CSS grid or absolute positioning
  - Grid gap: 8px, cell size: equal division of available space
  - Background of board: #0D1B2A, rounded-xl, padding 8px

Use Tailwind for layout and spacing where possible.
Use inline styles only for dynamic values (colors, positions).
```

---

## STEP 7 — HUD Component

**Attach to context:** `src/types/index.ts`

**Prompt:**
```
Implement src/components/HUD.tsx.

Props:
  moves: number
  levelTitle: string
  levelSubtitle: string
  onReset: () => void
  onGoToMap: () => void

Layout (top of game screen, above the board):
  Left side: back arrow button → onGoToMap
  Center: level title (bold) + subtitle (small, muted)
  Right side: move counter ("12 moves")

Below the board (separate row):
  Reset button — full width, secondary style, text: "↺ Reset"

All text white or light gray.
Background: transparent (the game screen sets the background).
Use Tailwind only.
```

---

## STEP 8 — Win Screen

**Attach to context:** `src/types/index.ts`, `src/data/levels.ts`

**Prompt:**
```
Implement src/components/WinScreen.tsx.

Props:
  level: Level
  moves: number
  stars: number       // 1 | 2 | 3
  onNext: () => void
  onRetry: () => void
  onMap: () => void

Layout (centered card, appears over the board with fade-in):
  1. Large emoji: 🎉
  2. Title: "Level complete"
  3. Star row: render 1–3 filled stars (⭐) based on stars prop, remaining as (☆)
     Always show 3 star positions.
  4. Move count: "Solved in X moves" (gray if above optimal, gold if optimal or below)
  5. Concept box (rounded, slightly lighter background):
     - Small label: "WHAT YOU PRACTICED"
     - Concept text: level.concept (italic, readable size)
     - Dependency diagram: level.dependency_label (monospace, centered, color accent)
  6. Two buttons:
     - Primary: "Next Level →" → onNext
     - Secondary: "Retry" → onRetry
  7. Small text link: "Level Map" → onMap

Fade-in animation on mount (opacity 0 → 1, translateY 8px → 0, 0.3s ease).
Background: dark overlay (#0D1B2A at 95% opacity) or blurred backdrop.
```

---

## STEP 9 — Level Map Screen

**Attach to context:** `src/types/index.ts`, `src/data/levels.ts`

**Prompt:**
```
Implement src/components/LevelMap.tsx.

Props:
  completedLevels: Record<number, number>   // levelId → star count
  currentLevelId: number
  onSelectLevel: (id: number) => void
  onBack: () => void

Layout:
  Header: back arrow + title "HINDSIGHT"

  Grid of 15 level nodes (3 columns × 5 rows):
    Each node shows:
    - Level number
    - Lock icon if not yet reachable (level > highest completed + 1)
    - Star count if completed (1–3 small stars)
    - Highlight if currently active level

  A level is reachable if:
    id === 1, OR completedLevels contains id - 1

  On click of a reachable level: call onSelectLevel(id)
  Locked levels: no click handler, dimmed appearance

  Color scheme:
    Locked: dark gray, muted text
    Reachable (not completed): white border, white text
    Completed: filled color with star count
    Current: bright white with ring

Use Tailwind grid (grid-cols-3 gap-4).
```

---

## STEP 10 — Intro Screen

**Attach to context:** none needed

**Prompt:**
```
Implement src/components/IntroScreen.tsx.

Props:
  onStart: () => void    // goes to level map
  hasProgress: boolean   // true if completedLevels is not empty

Layout (centered, full screen):
  1. Large logo: "HINDSIGHT" — large, bold, geometric font
     Subtitle: "The board is already set. Now undo it."
  2. How to play (compact, 3 lines):
     - Each piece shows an arrow — its last move direction
     - Click a piece to undo its move
     - Sometimes another piece is in the way. Figure out what moves first.
  3. Primary button:
     - If !hasProgress: "Start →"
     - If hasProgress: "Continue →"
  4. If hasProgress: small secondary link "Start over" (clears localStorage on click, reloads)

Background: #0D1B2A
All text white.
Font: use system-ui or import Space Grotesk from Google Fonts.
The word HINDSIGHT in the logo: make the first letter H contain a subtle ← arrow
using a ::before pseudo-element or a span with a rotated character.
```

---

## STEP 11 — App.tsx (Wire Everything Together)

**Attach to context:** all component files, `src/store/useGameStore.ts`

**Prompt:**
```
Implement src/App.tsx to wire together all screens and components.

Import useGameStore from "./store/useGameStore".
Import all screen components and Board, HUD.
Import LEVELS from "./data/levels".

Render logic based on state.screen:

"intro":
  <IntroScreen
    onStart={() => dispatch({ type: "GO_TO_MAP" })}
    hasProgress={Object.keys(state.completedLevels).length > 0}
  />

"map":
  <LevelMap
    completedLevels={state.completedLevels}
    currentLevelId={state.currentLevelId}
    onSelectLevel={(id) => dispatch({ type: "GO_TO_LEVEL", levelId: id })}
    onBack={() => dispatch({ type: "GO_TO_INTRO" })}
  />

"game":
  Derive currentLevel = LEVELS.find(l => l.id === state.currentLevelId)
  <div> (full screen, bg #0D1B2A, text white)
    <HUD
      moves={state.moves}
      levelTitle={currentLevel.title}
      levelSubtitle={currentLevel.subtitle}
      onReset={() => dispatch({ type: "RESET_LEVEL" })}
      onGoToMap={() => dispatch({ type: "GO_TO_MAP" })}
    />
    <Board
      pieces={state.pieces}
      onUndo={(id) => dispatch({ type: "UNDO_PIECE", pieceId: id })}
    />
  </div>

"win":
  Derive currentLevel and stars from completedLevels[currentLevelId]
  <WinScreen
    level={currentLevel}
    moves={state.moves}
    stars={stars}
    onNext={() => dispatch({ type: "NEXT_LEVEL" })}
    onRetry={() => dispatch({ type: "RESET_LEVEL" })}
    onMap={() => dispatch({ type: "GO_TO_MAP" })}
  />

Full-screen layout. Background color #0D1B2A always.
Max-width container: 400px centered, with auto horizontal margins.
```

---

## STEP 12 — Final Polish Pass

**Attach to context:** all files

**Prompt:**
```
Polish pass — do all of the following:

1. ANIMATIONS
   - Piece removal: fade out + scale down (opacity 0, scale 0.8) over 0.25s before removing from DOM
   - Win screen: slide up from bottom (translateY 20px → 0) over 0.3s
   - Level map: staggered fade-in for each node (delay 30ms × index)

2. RESPONSIVE
   - Board should fill the screen width on mobile (max 90vw, always square)
   - Minimum tap target for each piece: 44px × 44px

3. FAVICON + META
   - Set page title to "HINDSIGHT"
   - Set meta description: "The puzzle that trains backward thinking."
   - Use ⏪ as favicon (text-based SVG favicon)

4. ACCESSIBILITY
   - Each piece button: aria-label="Undo piece [id], moving [dir]"
   - Win screen: auto-focus the Next Level button on mount

5. PERFORMANCE
   - Memoize Board with React.memo
   - Memoize Piece with React.memo (compare by id, color, row, col, dir)

6. EMPTY STATE
   - If a level somehow has no pieces on mount: immediately trigger win (defensive check in GO_TO_LEVEL)
```

---

## DONE — What You Have

After these 12 steps, you have a complete, shippable web version of HINDSIGHT:
- 15 hand-crafted levels
- Full game logic (undo, block detection, win detection)
- Progress persistence (localStorage)
- Star ratings
- Educational win screens
- Level map with lock/unlock
- Polished animations
- Mobile-ready

**Next milestone:** React Native port (reuse all logic from `gameLogic.ts` and `levels.ts` unchanged — only rebuild the components).
