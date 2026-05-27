/**
 * CLI entry: mine 100 levels and write src/data/generatedLevels.ts
 * Run: npm run generate:levels
 */
import {
  clearCheckpoint,
  mineAll100Levels,
  minedToLevels,
  writeGeneratedLevels,
} from "./levelGenerator.ts";

const fresh = process.argv.includes("--fresh");
if (fresh) clearCheckpoint();
const resume = !fresh;
console.log(
  resume
    ? "Hindsight — generating 100 levels (resume from checkpoint if present)…"
    : "Hindsight — generating 100 levels (fresh run)…",
);
const mined = mineAll100Levels(undefined, { resume: !fresh });
const levels = minedToLevels(mined);
writeGeneratedLevels(levels);
console.log("Done.");
