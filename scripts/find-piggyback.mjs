import { countWinningClickSequences } from "../src/logic/levelSolver.ts";

const DIRS = ["up", "down", "left", "right"];

function pathsOfLength(n) {
  if (n === 0) return [[]];
  const out = [];
  for (const p of pathsOfLength(n - 1)) {
    for (const d of DIRS) out.push([...p, d]);
  }
  return out;
}

const pA = ["up", "up"];
for (const pB of pathsOfLength(4)) {
  const pieces = [
    { id: "A", color: "red", row: 2, col: 1, undoPath: pA, movesLeft: 2 },
    { id: "B", color: "blue", row: 3, col: 1, undoPath: pB, movesLeft: 4 },
  ];
  const n = countWinningClickSequences(pieces);
  if (n === 1) console.log(pB.join(","));
}
