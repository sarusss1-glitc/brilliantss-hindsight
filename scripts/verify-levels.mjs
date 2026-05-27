// Solvability check: npm run verify:levels
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { minMovesToSolve } = await import(
  pathToFileURL(join(root, "src/logic/levelSolver.ts")).href,
);
const { GENERATED_LEVELS } = await import(
  pathToFileURL(join(root, "src/data/generatedLevels.ts")).href,
);
const LEVELS = GENERATED_LEVELS;

for (const level of LEVELS) {
  const pieces = level.pieces.map((p) => ({
    ...p,
    undoPath: [...p.undoPath],
    movesLeft: p.undoPath.length,
  }));
  const min = minMovesToSolve(pieces);
  console.log(
    `Level ${level.id} (${level.title}):`,
    min === null ? "UNSOLVABLE" : `${min} moves (optimal_moves=${level.optimal_moves})`,
  );
}
