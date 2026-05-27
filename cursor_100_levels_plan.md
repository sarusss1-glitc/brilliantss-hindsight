# Hindsight: 100 Levels Generation Plan

## The Challenge
Designing 100 logic puzzles by hand is nearly impossible if we want to guarantee:
1. Every level is **100% solvable**.
2. Every level requires **actual thinking** (not just simple clicking).
3. A perfect **difficulty curve** that gradually increases.

As we saw, humans (and AI code assistants like Cursor) struggle to manually place pieces without creating trivial or broken puzzles.

## The Solution: Procedural Mining & BFS Validation
במקום לכתוב את השלבים ידנית, נכתב סקריפט מתמטי ב-Node.js שנמצא תחת `scripts/levelGenerator.ts`.

### How it Works
1. **Random Generation:** האלגוריתם ממקם כלים ומייצר מסלולים רנדומליים.
2. **BFS Solver:** הוא מנסה לפתור את הפאזל באמצעות חיפוש לעומק (Breadth-First Search).
3. **Complexity Scoring:** הוא מודד את המורכבות (Complexity) לפי כמות המצבים השונים שהוא היה צריך לחשב כדי למצוא את הפתרון.

## 100 Levels Difficulty Curve Plan
We will run the generator script iteratively to mine exactly 100 levels, grouped into worlds:

### World 1: The Basics (Levels 1-20)
* **Pieces:** 2 to 3
* **Complexity Score:** 10 to 50

### World 2: The Tangle (Levels 21-50)
* **Pieces:** 3 to 4
* **Complexity Score:** 100 to 500

### World 3: Traffic Jam (Levels 51-80)
* **Pieces:** 4 to 5
* **Complexity Score:** 1,000 to 3,000

### World 4: Brain Melter (Levels 81-100)
* **Pieces:** 5 to 6
* **Complexity Score:** 5,000 to 15,000+

## Directives for Cursor
1. Examine the script in `scripts/levelGenerator.ts`.
2. Expand the script so it automatically runs a loop, mining exactly 100 levels according to the "100 Levels Difficulty Curve Plan" above. 
3. Make sure to generate the levels progressively and output them directly to a valid TypeScript file `src/data/generatedLevels.ts` as an array of `Level` objects.
4. Hook the UI and the store up to this new 100-level file instead of the old hardcoded levels.
