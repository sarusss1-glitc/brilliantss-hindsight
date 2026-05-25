import { useReducer } from "react";
import type { GameAction, GameState } from "../types";
import { LEVELS } from "../data/levels";
import { undoPiece, checkWin, calculateStars } from "../logic/gameLogic";

const PROGRESS_KEY = "hindsight_progress";

function loadProgress(): Record<number, number> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<number, number>;
  } catch {
    return {};
  }
}

function saveProgress(completed: Record<number, number>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
}

function mergeStars(
  record: Record<number, number>,
  levelId: number,
  stars: number,
): Record<number, number> {
  const prev = record[levelId] ?? 0;
  return { ...record, [levelId]: Math.max(prev, stars) };
}

function goToLevel(state: GameState, levelId: number): GameState {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return state;

  const pieces = JSON.parse(JSON.stringify(level.pieces)) as GameState["pieces"];

  if (pieces.length === 0) {
    const stars = calculateStars(0, level.optimal_moves);
    const completedLevels = mergeStars(state.completedLevels, levelId, stars);
    saveProgress(completedLevels);
    return {
      ...state,
      screen: "win",
      currentLevelId: levelId,
      pieces: [],
      moves: 0,
      won: true,
      completedLevels,
    };
  }

  return {
    ...state,
    screen: "game",
    currentLevelId: levelId,
    pieces,
    moves: 0,
    won: false,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "GO_TO_INTRO":
      return { ...state, screen: "intro" };

    case "GO_TO_MAP":
      return { ...state, screen: "map", won: false };

    case "GO_TO_LEVEL":
      return goToLevel(state, action.levelId);

    case "RESET_LEVEL":
      return goToLevel(state, state.currentLevelId);

    case "NEXT_LEVEL": {
      if (state.currentLevelId < 15) {
        return goToLevel(state, state.currentLevelId + 1);
      }
      return { ...state, screen: "map", won: false };
    }

    case "UNDO_PIECE": {
      if (state.won) return state;

      const { updatedPieces, result } = undoPiece(state.pieces, action.pieceId);
      if (result === "blocked" || result === "invalid") return state;

      const moves = state.moves + 1;

      if (checkWin(updatedPieces)) {
        const level = LEVELS.find((l) => l.id === state.currentLevelId);
        if (!level) {
          return { ...state, pieces: updatedPieces, moves, won: true, screen: "win" };
        }
        const stars = calculateStars(moves, level.optimal_moves);
        const completedLevels = mergeStars(
          state.completedLevels,
          state.currentLevelId,
          stars,
        );
        saveProgress(completedLevels);
        return {
          ...state,
          pieces: updatedPieces,
          moves,
          won: true,
          screen: "win",
          completedLevels,
        };
      }

      return { ...state, pieces: updatedPieces, moves };
    }

    default:
      return state;
  }
}

function getInitialState(): GameState {
  return {
    screen: "intro",
    currentLevelId: 1,
    pieces: [],
    moves: 0,
    won: false,
    completedLevels: loadProgress(),
  };
}

export function useGameStore() {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);
  return { state, dispatch };
}
