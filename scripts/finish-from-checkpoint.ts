/**
 * Resume mining from checkpoint and refresh generatedLevels.ts.
 * Also writes partial output immediately if --partial-only is passed.
 *
 *   npm run generate:levels:partial   # write checkpoint → TS (no mining)
 *   npm run generate:levels           # resume + finish + write
 */
import {
  mineAll100Levels,
  minedToLevels,
  writeGeneratedLevels,
  writeLevelsFromCheckpoint,
} from "./levelGenerator.ts";

const partialOnly = process.argv.includes("--partial-only");

if (partialOnly) {
  const n = writeLevelsFromCheckpoint();
  console.log(n > 0 ? `Wrote ${n} levels from checkpoint.` : "No checkpoint found.");
  process.exit(n > 0 ? 0 : 1);
}

const existing = writeLevelsFromCheckpoint();
if (existing > 0) {
  console.log(`Checkpoint export: ${existing} levels written (partial OK).`);
}

console.log("Resuming mining from checkpoint…");
const mined = mineAll100Levels(undefined, { resume: true });
const levels = minedToLevels(mined);
writeGeneratedLevels(levels);
console.log(`Done — ${levels.length} levels total.`);
