import { memo } from "react";
import type { Direction, Piece as PieceType, PieceColor } from "../types";
import { PATH_ARROW, pathStackLabel } from "../constants/pathArrows";

const COLORS: Record<PieceColor, string> = {
  red: "#E53935",
  blue: "#1E88E5",
  green: "#43A047",
  purple: "#8E24AA",
  orange: "#FB8C00",
  teal: "#00897B",
  yellow: "#FDD835",
};

function pathsEqual(a: Direction[], b: Direction[]) {
  return a.length === b.length && a.every((d, i) => d === b[i]);
}

export type PieceProps = {
  piece: PieceType;
  onUndo: (id: string) => void;
  isShaking: boolean;
  isHighlighted: boolean;
};

function UndoPathStack({ path }: { path: Direction[] }) {
  if (path.length === 0) return null;

  return (
    <div
      className="flex w-full flex-col items-center gap-0 rounded-t-md border border-white/25 bg-[#0a1520]/90 px-1 py-1 shadow-md backdrop-blur-sm"
      aria-hidden
    >
      {path.map((dir, index) => {
        const isNext = index === 0;
        return (
          <span
            key={`${index}-${dir}`}
            className={[
              "leading-none tabular-nums text-white drop-shadow-sm",
              isNext
                ? "text-lg font-black tracking-tight"
                : "text-[11px] font-medium text-white/65",
            ].join(" ")}
            title={isNext ? "Next move" : undefined}
          >
            {PATH_ARROW[dir]}
          </span>
        );
      })}
    </div>
  );
}

function PieceInner({ piece, onUndo, isShaking, isHighlighted }: PieceProps) {
  const { undoPath } = piece;
  if (undoPath.length === 0) return null;

  const bg = COLORS[piece.color];

  return (
    <button
      type="button"
      aria-label={`Piece ${piece.id}, ${pathStackLabel(undoPath)}`}
      className={[
        "flex h-full w-full min-h-[44px] min-w-[44px] flex-col overflow-visible rounded-md shadow-md transition-transform duration-200 ease-in-out cursor-pointer select-none",
        isShaking ? "animate-shake" : "",
        isHighlighted ? "animate-pulse-border ring-2 ring-amber-300 ring-offset-1 ring-offset-[#0D1B2A]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onUndo(piece.id)}
    >
      <UndoPathStack path={undoPath} />
      <div
        className="flex min-h-[36px] flex-1 items-center justify-center rounded-b-md font-bold text-white"
        style={{ backgroundColor: bg }}
      >
        <span className="text-sm opacity-90">{piece.id}</span>
      </div>
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
