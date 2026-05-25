export type IntroScreenProps = {
  onStart: () => void;
  hasProgress: boolean;
  onStartOver: () => void;
};

export function IntroScreen({
  onStart,
  hasProgress,
  onStartOver,
}: IntroScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D1B2A] px-6 text-white">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-['Space_Grotesk',system-ui,sans-serif] text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="relative inline-block">
            <span
              className="absolute -left-1 top-1/2 text-sky-400 -translate-y-1/2 text-2xl opacity-80 sm:text-3xl"
              aria-hidden
            >
              ←
            </span>
            <span className="pl-5">HINDSIGHT</span>
          </span>
        </h1>
        <p className="mt-3 text-lg text-white/75">
          The board is already set. Now undo it.
        </p>
        <div className="mt-10 space-y-2 text-left text-sm text-white/70">
          <p>• Each piece shows an arrow — its last move direction.</p>
          <p>• Click a piece to undo its move.</p>
          <p>
            • Sometimes another piece is in the way. Figure out what moves
            first.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-10 w-full rounded-xl bg-sky-500 py-4 text-lg font-semibold text-white hover:bg-sky-400"
        >
          {hasProgress ? "Continue →" : "Start →"}
        </button>
        {hasProgress && (
          <button
            type="button"
            onClick={onStartOver}
            className="mt-4 text-sm text-white/50 underline hover:text-white/80"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
