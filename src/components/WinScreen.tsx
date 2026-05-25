import { useEffect, useRef } from "react";
import type { Level } from "../types";

export type WinScreenProps = {
  level: Level;
  moves: number;
  stars: number;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
};

export function WinScreen({
  level,
  moves,
  stars,
  onNext,
  onRetry,
  onMap,
}: WinScreenProps) {
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  const optimal = moves <= level.optimal_moves;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(13, 27, 42, 0.95)" }}
    >
      <div
        className="w-full max-w-[400px] animate-[winIn_0.3s_ease-out_forwards] rounded-2xl border border-white/10 bg-[#0D1B2A] p-6 text-white shadow-xl"
        style={{ opacity: 0, transform: "translateY(8px)" }}
      >
        <p className="mb-2 text-center text-5xl">🎉</p>
        <h2 className="mb-4 text-center text-2xl font-bold">Level complete</h2>
        <div className="mb-4 flex justify-center gap-1 text-3xl">
          {[0, 1, 2].map((i) => (
            <span key={i}>{i < stars ? "⭐" : "☆"}</span>
          ))}
        </div>
        <p
          className={`mb-4 text-center text-lg ${optimal ? "text-amber-300" : "text-white/60"}`}
        >
          Solved in {moves} {moves === 1 ? "move" : "moves"}
        </p>
        <div className="mb-6 rounded-xl bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            What you practiced
          </p>
          <p className="mb-3 text-sm italic text-white/90">{level.concept}</p>
          <p className="text-center font-mono text-sm text-sky-300">
            {level.dependency_label}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-white hover:bg-sky-400"
          >
            Next Level →
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-lg border border-white/20 py-3 text-white/90 hover:bg-white/10"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onMap}
            className="text-center text-sm text-white/50 underline hover:text-white/80"
          >
            Level Map
          </button>
        </div>
      </div>
      <style>{`
        @keyframes winIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
