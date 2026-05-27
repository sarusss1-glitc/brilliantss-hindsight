import { Fragment } from "react";
import { LEVELS } from "../data/levels";

export type LevelMapProps = {
  completedLevels: Record<number, number>;
  currentLevelId: number;
  onSelectLevel: (id: number) => void;
  onBack: () => void;
};

function isReachable(id: number, completed: Record<number, number>): boolean {
  if (id === 1) return true;
  return completed[id - 1] !== undefined;
}

const WORLD_HEADERS: Record<number, string> = {
  1: "World 1 · The Basics",
  21: "World 2 · The Tangle",
  51: "World 3 · Traffic Jam",
  81: "World 4 · Brain Melter",
};

export function LevelMap({
  completedLevels,
  currentLevelId,
  onSelectLevel,
  onBack,
}: LevelMapProps) {
  return (
    <div className="min-h-screen bg-[#0D1B2A] px-4 py-6 text-white">
      <div className="mx-auto max-w-[400px]">
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-2 py-2 text-xl hover:bg-white/10"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="text-xl font-bold tracking-tight">HINDSIGHT</h1>
        </header>
        <div className="grid grid-cols-3 gap-4">
          {LEVELS.map((level, index) => {
            const reachable = isReachable(level.id, completedLevels);
            const stars = completedLevels[level.id];
            const done = stars !== undefined;
            const current = level.id === currentLevelId;
            const worldLabel = WORLD_HEADERS[level.id];

            return (
              <Fragment key={level.id}>
                {worldLabel && (
                  <h2 className="col-span-3 pt-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                    {worldLabel}
                  </h2>
                )}
              <button
                key={level.id}
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onSelectLevel(level.id)}
                style={{ animationDelay: `${index * 30}ms` }}
                className={[
                  "flex min-h-[88px] flex-col items-center justify-center rounded-xl border-2 p-3 text-sm font-semibold transition-opacity animate-[fadeNode_0.4s_ease-out_forwards]",
                  !reachable
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                    : done
                      ? "border-sky-400/60 bg-sky-500/20 text-white"
                      : "border-white/40 bg-white/5 text-white hover:bg-white/10",
                  current ? "ring-2 ring-white ring-offset-2 ring-offset-[#0D1B2A]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="text-lg">{level.id}</span>
                {!reachable && <span className="mt-1 text-xs">🔒</span>}
                {done && (
                  <span className="mt-1 text-xs">
                    {"⭐".repeat(stars)}
                    {"☆".repeat(Math.max(0, 3 - stars))}
                  </span>
                )}
              </button>
              </Fragment>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeNode {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
