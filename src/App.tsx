import { useCallback } from "react";
import { useGameStore } from "./store/useGameStore";
import { LEVELS } from "./data/levels";
import { calculateStars } from "./logic/gameLogic";
import { IntroScreen } from "./components/IntroScreen";
import { LevelMap } from "./components/LevelMap";
import { Board } from "./components/Board";
import { HUD } from "./components/HUD";
import { WinScreen } from "./components/WinScreen";

const PROGRESS_KEY = "hindsight_progress";

export default function App() {
  const { state, dispatch } = useGameStore();

  const onUndo = useCallback(
    (id: string) => dispatch({ type: "UNDO_PIECE", pieceId: id }),
    [dispatch],
  );

  const onStartOver = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    window.location.reload();
  }, []);

  const currentLevel = LEVELS.find((l) => l.id === state.currentLevelId);
  const winStars = currentLevel
    ? (state.completedLevels[state.currentLevelId] ??
      calculateStars(state.moves, currentLevel.optimal_moves))
    : 1;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {state.screen === "intro" && (
        <IntroScreen
          onStart={() => dispatch({ type: "GO_TO_MAP" })}
          hasProgress={Object.keys(state.completedLevels).length > 0}
          onStartOver={onStartOver}
        />
      )}

      {state.screen === "map" && (
        <LevelMap
          completedLevels={state.completedLevels}
          currentLevelId={state.currentLevelId}
          onSelectLevel={(id) => dispatch({ type: "GO_TO_LEVEL", levelId: id })}
          onBack={() => dispatch({ type: "GO_TO_INTRO" })}
        />
      )}

      {state.screen === "game" && currentLevel && (
        <div className="mx-auto flex min-h-screen max-w-[400px] flex-col px-4 py-6">
          <HUD
            moves={state.moves}
            levelTitle={currentLevel.title}
            levelSubtitle={currentLevel.subtitle}
            onGoToMap={() => dispatch({ type: "GO_TO_MAP" })}
          />
          <div className="mt-4 flex flex-1 flex-col justify-center">
            <Board pieces={state.pieces} onUndo={onUndo} />
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_LEVEL" })}
            className="mt-6 w-full rounded-lg border border-white/20 bg-white/5 py-3 text-white/90 hover:bg-white/10"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {state.screen === "win" && currentLevel && (
        <WinScreen
          level={currentLevel}
          moves={state.moves}
          stars={winStars}
          onNext={() => dispatch({ type: "NEXT_LEVEL" })}
          onRetry={() => dispatch({ type: "RESET_LEVEL" })}
          onMap={() => dispatch({ type: "GO_TO_MAP" })}
        />
      )}
    </div>
  );
}
