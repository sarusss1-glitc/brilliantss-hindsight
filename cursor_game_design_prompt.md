# Hindsight Game - Core Mechanics & Logic Prompt

This file contains the foundational logic, rules, and UI requirements for our game. 
You can use this prompt at any time to feed into Cursor, Claude, or any AI assistant to instantly align it with the project's vision and mechanics.

---

## Prompt to Copy-Paste:

Please upgrade our puzzle game engine with full visual UI clarity and complete core logic. The game must be intuitive, readable, and perfectly functional.

1. **Visual UI for the "Stack" (undoPath):**
- The player MUST be able to visually see the remaining `undoPath` for every piece. It cannot be hidden in the background.
- Please render a visual representation of the stack directly on the pieces (or floating just above them).
- Use small directional arrows (↑, ↓, ←, →) to represent the strings in the `undoPath` array ("up", "down", "left", "right").
- The arrows must be displayed in order. The first arrow in the sequence (the very next move) should be clearly identifiable (e.g., larger or at the top).
- When a piece successfully moves and we `shift()` its array, the visual stack MUST dynamically update to remove the consumed arrow.

2. **Complete Core Game Logic (To implement/refine):**
- **The Queue:** `undoPath` is a queue. On a successful move by the active piece, `shift()` its `undoPath`.
- **Winning a Piece:** A piece successfully exits the board ONLY if it moves Out of Bounds EXACTLY when its `undoPath.length === 1`.
- **Failure (Invalid Moves):**
  a) A piece's `undoPath` becomes empty while it is still on the board.
  b) A piece moves Out of Bounds while its `undoPath.length > 1`.
- **The "Elastic Push" Mechanic:**
  If the active piece attempts to move into a cell occupied by piece B:
  - It does NOT fail. It PUSHES piece B 1 cell in the movement direction.
  - The push is VALID ONLY if the cell behind piece B is empty AND within the board boundaries (e.g., indices 0 to 3 for a 4x4 board).
  - Piece B's coordinates change, but Piece B's `undoPath` stack is NOT consumed or altered by being pushed.
  - The active piece moves into the cell previously held by B, and the active piece consumes 1 step from its own `undoPath`.
  - Only ONE piece can be pushed at a time (no chain pushing).

3. **Test Level Data:**
Implement this specific level to test the visual arrows, the push mechanic, and the exit logic:

```json
{
  "level": 1,
  "name": "The Setup",
  "pieces": [
    { "id": "A", "color": "red", "row": 3, "col": 1, "undoPath": ["up", "right", "right", "right"] },
    { "id": "B", "color": "blue", "row": 2, "col": 1, "undoPath": ["up", "up"] }
  ]
}
```
