import { countWinningClickSequences, minMovesToSolve } from "../src/logic/levelSolver.ts";

const DIRS = ["up", "down", "left", "right"];
const COLORS = ["red", "blue", "green", "yellow", "purple", "teal"];

function pathsOfLength(n) {
  if (n === 0) return [[]];
  const out = [];
  for (const p of pathsOfLength(n - 1)) {
    for (const d of DIRS) out.push([...p, d]);
  }
  return out;
}

function makePieces(specs) {
  return specs.map((s, i) => ({
    id: s.id,
    color: COLORS[i % COLORS.length],
    row: s.row,
    col: s.col,
    undoPath: [...s.path],
    movesLeft: s.path.length,
  }));
}

const found = [];

// 2 pieces, all positions and paths len 2-4 (sampled)
for (let r1 = 0; r1 < 4; r1++) {
  for (let c1 = 0; c1 < 4; c1++) {
    for (let r2 = 0; r2 < 4; r2++) {
      for (let c2 = 0; c2 < 4; c2++) {
        if (r1 === r2 && c1 === c2) continue;
        for (const len1 of [2, 3]) {
          for (const len2 of [2, 3, 4]) {
            for (const p1 of pathsOfLength(len1).slice(0, 40)) {
              for (const p2 of pathsOfLength(len2).slice(0, 40)) {
                const specs = [
                  { id: "A", row: r1, col: c1, path: p1 },
                  { id: "B", row: r2, col: c2, path: p2 },
                ];
                const pieces = makePieces(specs);
                const min = minMovesToSolve(pieces);
                if (min === null) continue;
                const count = countWinningClickSequences(pieces);
                if (count === 1) {
                  found.push({ specs, min });
                  console.log("2p", { min, specs });
                }
              }
            }
          }
        }
      }
    }
  }
}

console.log("total unique 2-piece", found.length);
