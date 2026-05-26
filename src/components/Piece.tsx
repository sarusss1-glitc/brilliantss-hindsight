import { memo } from "react";
import type { Direction, Piece as PieceType, PieceColor } from "../types";

const COLORS: Record<PieceColor, string> = {
  red: "#E53935",
  blue: "#1E88E5",
  green: "#43A047",
  purple: "#8E24AA",
  orange: "#FB8C00",
  teal: "#00897B",
  yellow: "#FDD835",
};

const UNDO_ARROW: Record<Direction, string> = {
  right: "←",
  left: "→",
  down: "↑",
  up: "↓",
};

function ariaDir(dir: Direction): string {
  switch (dir) {
    case "right":
      return "left";
    case "left":
      return "right";
    case "down":
      return "up";
    case "up":
      return "down";
  }
}

function pathsEqual(a: Direction[], b: Direction[]) {
  return a.length === b.length && a.every((d, i) => d === b[i]);
}

export type PieceProps = {
  piece: PieceType;
  onUndo: (id: string) => void;
  isShaking: boolean;
  isHighlighted: boolean;
};

function PieceInner({ piece, onUndo, isShaking, isHighlighted }: PieceProps) {
  const dir = piece.undoPath[0];
  if (piece.undoPath.length === 0 || dir === undefined) return null;

  const bg = COLORS[piece.color];
  const arrow = UNDO_ARROW[dir];

  return (
    <button
      type="button"
      aria-label={`Undo piece ${piece.id}, moving ${ariaDir(dir)}`}
      className={[
        "flex h-full w-full min-h-[44px] min-w-[44px] items-center justify-center rounded-md font-bold text-white shadow-md transition-transform duration-200 ease-in-out cursor-pointer select-none",
        isShaking ? "animate-shake" : "",
        isHighlighted ? "animate-pulse-border" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: bg }}
      onClick={() => onUndo(piece.id)}
    >
      <span className="text-2xl leading-none drop-shadow-sm">{arrow}</span>
    </button>
  );
}

function piecePropsEqual(a: PieceProps, b: PieceProps) {
  return (
    a.piece.id === b.piece.id &&
    a.piece.color === b.piece.color &&
    a.piece.row === b.piece.row &&
    a.piece.col === b.piece.col &&
    a.piece.movesLeft === b.piece.movesLeft &&
    pathsEqual(a.piece.undoPath, b.piece.undoPath) &&
    a.isShaking === b.isShaking &&
    a.isHighlighted === b.isHighlighted
  );
}

export const Piece = memo(PieceInner, piecePropsEqual);
