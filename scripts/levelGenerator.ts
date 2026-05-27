import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { undoPiece } from "../src/logic/gameLogic";
import type { Category, Direction, Level, Piece, PieceColor } from "../src/types";

const COLORS: PieceColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "teal",
];
const DIRS: Direction[] = ["up", "down", "left", "right"];

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECKPOINT_DIR = join(__dirname, ".checkpoints");
const CHECKPOINT_PATH = join(CHECKPOINT_DIR, "mined-levels.json");

type SerializedMined = {
  id: number;
  state: Piece[];
  solution: string[];
  complexity: number;
  world: number;
};

export function saveCheckpoint(mined: MinedLevel[]): void {
  mkdirSync(CHECKPOINT_DIR, { recursive: true });
  const payload: SerializedMined[] = mined.map((m) => ({
    id: m.id,
    state: m.state,
    solution: m.solution,
    complexity: m.complexity,
    world: m.world,
  }));
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(payload), "utf8");
}

function loadCheckpoint(): MinedLevel[] | null {
  if (!existsSync(CHECKPOINT_PATH)) return null;
  const payload = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8")) as SerializedMined[];
  return payload.map((m) => ({
    ...m,
    state: m.state.map((p) => ({
      ...p,
      undoPath: [...p.undoPath],
      movesLeft: p.undoPath.length,
    })),
  }));
}

export function clearCheckpoint(): void {
  if (existsSync(CHECKPOINT_PATH)) {
    writeFileSync(CHECKPOINT_PATH, "[]", "utf8");
  }
}

/** Write `generatedLevels.ts` from the latest checkpoint (partial runs OK). */
export function writeLevelsFromCheckpoint(): number {
  const mined = loadCheckpoint();
  if (!mined?.length) return 0;
  writeGeneratedLevels(minedToLevels(mined));
  return mined.length;
}

export { loadCheckpoint };

export type MinedLevel = {
  id: number;
  state: Piece[];
  solution: string[];
  complexity: number;
  world: number;
};

export type WorldSpec = {
  world: number;
  name: string;
  levelStart: number;
  levelCount: number;
  piecesMin: number;
  piecesMax: number;
  complexityMin: number;
  complexityMax: number;
  pathLengthMin: number;
  pathLengthMax: number;
  bfsLimit: number;
  maxAttempts: number;
  category: Category;
};

/** 100 Levels Difficulty Curve Plan */
export const WORLDS: WorldSpec[] = [
  {
    world: 1,
    name: "The Basics",
    levelStart: 1,
    levelCount: 20,
    piecesMin: 2,
    piecesMax: 3,
    complexityMin: 10,
    complexityMax: 50,
    pathLengthMin: 2,
    pathLengthMax: 3,
    bfsLimit: 8_000,
    maxAttempts: 80_000,
    category: "tutorial",
  },
  {
    world: 2,
    name: "The Tangle",
    levelStart: 21,
    levelCount: 30,
    piecesMin: 3,
    piecesMax: 4,
    complexityMin: 100,
    complexityMax: 500,
    pathLengthMin: 2,
    pathLengthMax: 4,
    bfsLimit: 25_000,
    maxAttempts: 200_000,
    category: "tree",
  },
  {
    world: 3,
    name: "Traffic Jam",
    levelStart: 51,
    levelCount: 30,
    piecesMin: 4,
    piecesMax: 5,
    complexityMin: 1_000,
    complexityMax: 3_000,
    pathLengthMin: 3,
    pathLengthMax: 5,
    bfsLimit: 80_000,
    maxAttempts: 500_000,
    category: "bottleneck",
  },
  {
    world: 4,
    name: "Brain Melter",
    levelStart: 81,
    levelCount: 20,
    piecesMin: 5,
    piecesMax: 6,
    complexityMin: 5_000,
    complexityMax: 15_000,
    pathLengthMin: 3,
    pathLengthMax: 6,
    bfsLimit: 250_000,
    maxAttempts: 2_000_000,
    category: "recursive",
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function targetForLevel(
  world: WorldSpec,
  indexInWorld: number,
): { pieces: number; complexity: number } {
  const t =
    world.levelCount <= 1 ? 0 : indexInWorld / (world.levelCount - 1);
  return {
    pieces: Math.round(lerp(world.piecesMin, world.piecesMax, t)),
    complexity: Math.round(lerp(world.complexityMin, world.complexityMax, t)),
  };
}

export function solveBFS(
  initialPieces: Piece[],
  bfsLimit: number,
): { moves: string[]; statesExplored: number } | null {
  const queue: { pieces: Piece[]; path: string[] }[] = [
    { pieces: initialPieces, path: [] },
  ];
  const visited = new Set<string>();

  const hash = (pieces: Piece[]) =>
    pieces
      .map((p) => `${p.id}:${p.row},${p.col}:${p.undoPath.join(">")}`)
      .sort()
      .join("|");

  visited.add(hash(initialPieces));
  let statesExplored = 0;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    statesExplored++;

    if (curr.pieces.length === 0) {
      return { moves: curr.path, statesExplored };
    }

    if (statesExplored > bfsLimit) return null;

    for (const p of curr.pieces) {
      const res = undoPiece(curr.pieces, p.id);
      if (res.result === "success") {
        const h = hash(res.updatedPieces);
        if (!visited.has(h)) {
          visited.add(h);
          queue.push({
            pieces: res.updatedPieces,
            path: [...curr.path, p.id],
          });
        }
      }
    }
  }

  return null;
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map((p) => ({
    ...p,
    undoPath: [...p.undoPath],
    movesLeft: p.undoPath.length,
  }));
}

function generateRandomState(
  numPieces: number,
  pathLengthMin: number,
  pathLengthMax: number,
): Piece[] {
  const pieces: Piece[] = [];
  const occupied = new Set<string>();

  for (let i = 0; i < numPieces; i++) {
    let r: number;
    let c: number;
    do {
      r = getRandomInt(4);
      c = getRandomInt(4);
    } while (occupied.has(`${r},${c}`));
    occupied.add(`${r},${c}`);

    const span = pathLengthMax - pathLengthMin + 1;
    const pathLen = pathLengthMin + getRandomInt(span);
    const path: Direction[] = [];
    for (let j = 0; j < pathLen; j++) {
      path.push(DIRS[getRandomInt(4)]);
    }

    pieces.push({
      id: String.fromCharCode(65 + i),
      color: COLORS[i % COLORS.length]!,
      row: r,
      col: c,
      undoPath: path,
      movesLeft: path.length,
    });
  }
  return pieces;
}

export function stateSignature(state: Piece[]): string {
  return state
    .map(
      (p) =>
        `${p.id}@${p.row},${p.col}:${p.undoPath.map((d) => d[0]).join("")}`,
    )
    .sort()
    .join("|");
}

export function mineOneLevel(
  target: { pieces: number; complexity: number },
  world: WorldSpec,
): MinedLevel | null {
  let relax = 0;
  const relaxStep =
    target.complexity >= 10_000
      ? Math.max(500, Math.floor(target.complexity * 0.12))
      : Math.max(1, Math.floor(target.complexity * 0.08));
  const maxRelax = Math.floor(target.complexity * 0.45);

  for (let attempt = 0; attempt < world.maxAttempts; attempt++) {
    const state = generateRandomState(
      target.pieces,
      world.pathLengthMin,
      world.pathLengthMax,
    );
    const totalMoves = state.reduce((sum, p) => sum + p.undoPath.length, 0);
    const solution = solveBFS(clonePieces(state), world.bfsLimit);

    if (!solution || solution.moves.length !== totalMoves) continue;

    const threshold = Math.max(1, target.complexity - relax);
    if (solution.statesExplored >= threshold) {
      return {
        id: 0,
        state: clonePieces(state),
        solution: solution.moves,
        complexity: solution.statesExplored,
        world: world.world,
      };
    }

    if (attempt > 0 && attempt % 50_000 === 0 && relax < maxRelax) {
      relax += relaxStep;
    }
  }

  return null;
}

export function mineLevels(
  count: number,
  numPieces: number,
  diffThreshold: number,
  options?: { pathLengthMin?: number; pathLengthMax?: number; bfsLimit?: number; maxAttempts?: number },
): MinedLevel[] {
  const world: WorldSpec = {
    world: 0,
    name: "custom",
    levelStart: 1,
    levelCount: count,
    piecesMin: numPieces,
    piecesMax: numPieces,
    complexityMin: diffThreshold,
    complexityMax: diffThreshold,
    pathLengthMin: options?.pathLengthMin ?? 2,
    pathLengthMax: options?.pathLengthMax ?? 4,
    bfsLimit: options?.bfsLimit ?? 15_000,
    maxAttempts: options?.maxAttempts ?? 100_000,
    category: "chain",
  };
  const found: MinedLevel[] = [];
  const seen = new Set<string>();

  while (found.length < count) {
    const mined = mineOneLevel(
      { pieces: numPieces, complexity: diffThreshold },
      world,
    );
    if (!mined) continue;
    const sig = stateSignature(mined.state);
    if (seen.has(sig)) continue;
    seen.add(sig);
    found.push(mined);
  }
  return found;
}

export function mineAll100Levels(
  onProgress?: (id: number, mined: MinedLevel) => void,
  options?: { resume?: boolean },
): MinedLevel[] {
  const resumed = options?.resume === true ? loadCheckpoint() : null;
  const all: MinedLevel[] = resumed ?? [];
  const globalSeen = new Set<string>(all.map((m) => stateSignature(m.state)));
  const resumeFromId = all.length > 0 ? Math.max(...all.map((m) => m.id)) + 1 : 1;

  if (all.length > 0) {
    console.log(`Resuming from checkpoint at level ${resumeFromId} (${all.length} saved).`);
  }

  for (const world of WORLDS) {
    console.log(
      `\n=== World ${world.world}: ${world.name} (levels ${world.levelStart}–${world.levelStart + world.levelCount - 1}) ===`,
    );

    for (let i = 0; i < world.levelCount; i++) {
      const levelId = world.levelStart + i;
      if (levelId < resumeFromId) continue;

      const target = targetForLevel(world, i);
      // Tail of World 4: ease mining thresholds so 93–100 finish in reasonable time.
      const complexityTarget =
        levelId >= 93
          ? Math.max(8_000, Math.floor(target.complexity * 0.72))
          : target.complexity;
      console.log(
        `Mining level ${levelId} — ${target.pieces} pieces, complexity ≥ ${complexityTarget}…`,
      );

      let mined: MinedLevel | null = null;
      let outerRelax = 0;
      const outerMaxRelax = Math.floor(complexityTarget * 0.45);
      const outerStep =
        complexityTarget >= 10_000
          ? Math.max(500, Math.floor(complexityTarget * 0.1))
          : Math.max(1, Math.floor(complexityTarget * 0.08));

      while (!mined && outerRelax <= outerMaxRelax) {
        mined = mineOneLevel(
          {
            pieces: target.pieces,
            complexity: Math.max(1, complexityTarget - outerRelax),
          },
          world,
        );
        if (!mined) outerRelax += outerStep;
      }

      if (!mined) {
        throw new Error(
          `Failed to mine level ${levelId} after relaxing complexity target.`,
        );
      }

      const sig = stateSignature(mined.state);
      if (globalSeen.has(sig)) {
        i--;
        console.log(`  Duplicate layout — retrying level ${levelId}`);
        continue;
      }
      globalSeen.add(sig);

      mined.id = levelId;
      mined.world = world.world;
      all.push(mined);
      saveCheckpoint(all);
      onProgress?.(levelId, mined);
      console.log(
        `  ✓ Level ${levelId}: complexity ${mined.complexity}, ${mined.solution.length} moves`,
      );
    }
  }

  return all;
}

function toLevel(mined: MinedLevel, world: WorldSpec): Level {
  const pieces: Piece[] = mined.state.map((p) => ({
    ...p,
    undoPath: [...p.undoPath],
    movesLeft: p.undoPath.length,
  }));

  const firstMove = mined.solution[0] ?? "A";
  const indexInWorld = mined.id - world.levelStart;

  return {
    id: mined.id,
    title:
      mined.id === 1
        ? "First Steps"
        : `Level ${mined.id}`,
    subtitle: `${world.name} · ${pieces.length} pieces`,
    category: world.category,
    concept:
      mined.id === 1
        ? "Tap a piece to undo one arrow. Clear every piece from the board."
        : `Procedural puzzle · search depth ${mined.complexity}`,
    dependency_label: `${pieces.length}p · c${mined.complexity}`,
    solution_hint: `Try piece ${firstMove} first.`,
    pieces,
    optimal_moves: mined.solution.length,
  };
}

export function minedToLevels(mined: MinedLevel[]): Level[] {
  return mined.map((m) => {
    const world = WORLDS.find(
      (w) => m.id >= w.levelStart && m.id < w.levelStart + w.levelCount,
    )!;
    return toLevel(m, world);
  });
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function formatGeneratedLevelsFile(levels: Level[]): string {
  const lines: string[] = [
    `import type { Direction, Level, PieceColor } from "../types";`,
    ``,
    `/** Auto-generated by scripts/levelGenerator.ts — do not edit by hand. */`,
    `export const GENERATED_LEVELS: Level[] = [`,
  ];

  for (const level of levels) {
    lines.push(`  {`);
    lines.push(`    id: ${level.id},`);
    lines.push(`    title: "${escapeString(level.title)}",`);
    lines.push(`    subtitle: "${escapeString(level.subtitle)}",`);
    lines.push(`    category: "${level.category}",`);
    lines.push(`    concept: "${escapeString(level.concept)}",`);
    lines.push(`    dependency_label: "${escapeString(level.dependency_label)}",`);
    lines.push(`    solution_hint: "${escapeString(level.solution_hint)}",`);
    lines.push(`    optimal_moves: ${level.optimal_moves},`);
    lines.push(`    pieces: [`);
    for (const p of level.pieces) {
      const path = p.undoPath.map((d) => `"${d}"`).join(", ");
      lines.push(`      {`);
      lines.push(`        id: "${p.id}",`);
      lines.push(`        color: "${p.color}" as PieceColor,`);
      lines.push(`        row: ${p.row},`);
      lines.push(`        col: ${p.col},`);
      lines.push(`        undoPath: [${path}] as Direction[],`);
      lines.push(`        movesLeft: ${p.movesLeft},`);
      lines.push(`      },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);
  return lines.join("\n");
}

export function writeGeneratedLevels(levels: Level[]): void {
  const outPath = join(__dirname, "../src/data/generatedLevels.ts");
  const content = formatGeneratedLevelsFile(levels);
  writeFileSync(outPath, content, "utf8");
  console.log(`\nWrote ${levels.length} levels to ${outPath}`);
}

function main(): void {
  console.log("Hindsight — mining 100 levels…");
  const mined = mineAll100Levels();
  const levels = minedToLevels(mined);
  writeGeneratedLevels(levels);
  console.log("Done.");
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url).replace(/\\/g, "/") ===
    process.argv[1].replace(/\\/g, "/");

if (isMain) {
  main();
}
