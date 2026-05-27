/**
 * Mine levels 93–100 only (fast tail config) and write full generatedLevels.ts.
 */
import {
  loadCheckpoint,
  mineOneLevel,
  minedToLevels,
  saveCheckpoint,
  stateSignature,
  targetForLevel,
  WORLDS,
  writeGeneratedLevels,
  type MinedLevel,
} from "./levelGenerator.ts";

const world = WORLDS[3]!;
const startId = 93;
const endId = 100;

const all = loadCheckpoint() ?? [];
if (all.length < 92) {
  console.error(`Expected 92 levels in checkpoint, got ${all.length}`);
  process.exit(1);
}

const globalSeen = new Set(all.map((m) => stateSignature(m.state)));

for (let levelId = startId; levelId <= endId; levelId++) {
  const i = levelId - world.levelStart;
  const base = targetForLevel(world, i);
  const target = {
    pieces: Math.min(5, base.pieces),
    complexity: Math.max(8_000, Math.floor(base.complexity * 0.65)),
  };

  console.log(`Mining ${levelId} — ${target.pieces}p, complexity ≥ ${target.complexity}`);

  let mined: MinedLevel | null = null;
  let relax = 0;
  const fastWorld = {
    ...world,
    pathLengthMax: 5,
    maxAttempts: 400_000,
    bfsLimit: 120_000,
  };

  while (!mined && relax <= target.complexity * 0.5) {
    mined = mineOneLevel(
      { pieces: target.pieces, complexity: target.complexity - relax },
      fastWorld,
    );
    if (!mined) relax += 800;
  }

  if (!mined) {
    console.error(`Failed level ${levelId}`);
    process.exit(1);
  }

  const sig = stateSignature(mined.state);
  if (globalSeen.has(sig)) {
    levelId--;
    console.log("Duplicate — retry");
    continue;
  }
  globalSeen.add(sig);

  mined.id = levelId;
  mined.world = world.world;
  all.push(mined);
  saveCheckpoint(all);
  console.log(`  ✓ ${levelId}: c=${mined.complexity}, moves=${mined.solution.length}`);
}

writeGeneratedLevels(minedToLevels(all));
console.log(`Done — ${all.length} levels.`);
