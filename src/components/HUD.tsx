export type HUDProps = {
  moves: number;
  levelTitle: string;
  levelSubtitle: string;
  onGoToMap: () => void;
};

export function HUD({
  moves,
  levelTitle,
  levelSubtitle,
  onGoToMap,
}: HUDProps) {
  return (
    <div className="w-full text-white">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onGoToMap}
          className="rounded-lg px-2 py-2 text-xl text-white/90 hover:bg-white/10"
          aria-label="Back to level map"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold leading-tight">{levelTitle}</h1>
          <p className="text-sm text-white/60">{levelSubtitle}</p>
        </div>
        <div className="shrink-0 pt-1 text-right text-sm text-white/90">
          {moves} {moves === 1 ? "move" : "moves"}
        </div>
      </div>
    </div>
  );
}
