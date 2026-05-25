# HINDSIGHT — Name & Narrative Document

---

## The Name: HINDSIGHT

**Why this name wins:**

"Hindsight is 20/20" — everyone knows the phrase. It means you can only understand something *after* it happens. HINDSIGHT flips that on its head: in this game, hindsight is not passive regret. It's an active weapon.

The name does three things at once:
1. **Describes the mechanic** — you think backward, from end to start
2. **Creates intrigue** — people know the phrase, but a game called HINDSIGHT makes them ask: "what does that mean here?"
3. **Carries emotional weight** — it sounds like self-improvement, like gaining a superpower you wish you always had

**Tagline options:**
- *"The puzzle that trains the skill you always wanted."*
- *"Everyone has hindsight. Few can use it."*
- *"Think backward. Win."*
- *"The board is already set. Now undo it."* ← recommended

---

## The Narrative

### The core story (one paragraph — for App Store, website, ads)

> The board is set. Every piece has already moved. Your job isn't to figure out where things go — it's to figure out how they got here, and undo it in exactly the right order. One wrong move and the path is blocked. Think backward. Trace the chain. Find the root. HINDSIGHT is the puzzle game that trains the one thinking skill most people never develop: reasoning from the end to the beginning.

---

### The hook (for social media / first 3 seconds)

> Most puzzle games ask: *where should this go?*
> HINDSIGHT asks: *how did it get here?*
> That one question changes everything.

---

### The educational angle (for product pages, educators, parents)

HINDSIGHT trains **backward induction** — a cognitive skill used by:
- **Chess grandmasters** (planning 10 moves ahead means starting from checkmate)
- **Software engineers** (debugging, dependency resolution, call stacks)
- **Project managers** (working backward from a deadline)
- **Mathematicians** (proof by contradiction, working from the goal)
- **Negotiators** (anticipating the other side's last move first)

The game teaches this skill without ever saying the words. Each of the 15 levels introduces a new pattern — a chain, a tree, a fork, a bottleneck — and by the end, your brain has been quietly retrained to ask: *"what had to happen before this?"*

---

### Level arc narrative (for onboarding / win screens)

Each win screen delivers a one-line insight that connects the puzzle to the real world:

| Level | Win Screen Insight |
|---|---|
| 1 | "You clicked. It moved. That's all hindsight is — recognizing what came before." |
| 2 | "B had to leave before A could follow. Every blocked path has a root." |
| 4 | "Three deep. Like a function calling a function calling a function." |
| 6 | "One move unlocked two paths. Solving a bottleneck multiplies your options." |
| 7 | "Two chains, no connection. Independent problems deserve independent solutions." |
| 9 | "One piece was blocking two others. Identify the real bottleneck. Remove it once." |
| 13 | "You managed two chains at once. That's parallel thinking." |
| 15 | "Everything depended on one piece. Find the root. Everything else follows." |

---

### The $5 pitch (App Store description, 150 words)

> **HINDSIGHT** is a logic puzzle game with one rule: undo every move, in the right order, until the board is empty.
>
> Easy to learn. Genuinely hard to master.
>
> Each piece shows an arrow — the direction it came from. Click it to send it back. But sometimes another piece is in the way. Figure out what needs to move first, and the whole chain unravels.
>
> 15 hand-crafted levels. Each one teaches a real concept: chains, trees, forks, bottlenecks, parallel paths. By the time you finish, you'll think differently. Not just in the game — everywhere.
>
> No timers. No ads. No energy bars. Just you and the puzzle.
>
> **HINDSIGHT. The board is already set. Now undo it.**

---

## Visual Identity Notes (for designer / Cursor)

**Aesthetic direction:** Clean, minimal, slightly cerebral. Think Monument Valley meets a whiteboard.

| Element | Direction |
|---|---|
| Background | Deep navy `#0D1B2A` or near-black |
| Grid cells | Dark slate `#1C2B3A` |
| Piece colors | Vivid, distinct — the 6 defined colors |
| Typography | Geometric sans-serif (e.g. Space Grotesk, DM Sans) |
| Arrows on pieces | Large, white, confident |
| Win screen | Warm gold accent `#F5C842` for stars |
| Logo mark | The word HINDSIGHT with the H subtly containing a backward arrow ←H |

---

## What Comes Next

With this document + `levels.ts` + `GDD.md`, Cursor has everything it needs.

Suggested Cursor prompt order:
1. Scaffold the project (`vite + react + typescript + tailwind`)
2. Create `types/index.ts` from the GDD types
3. Implement `logic/gameLogic.ts` (undo, isBlocked, checkWin)
4. Build `Board.tsx` + `Piece.tsx` with CSS transitions
5. Wire up state with `useReducer`
6. Add `LevelMap.tsx` and `WinScreen.tsx`
7. Polish: animations, sound (optional), localStorage persistence

