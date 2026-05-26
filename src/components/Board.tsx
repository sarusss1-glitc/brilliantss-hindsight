import { memo, useCallback, useRef, useState } from "react";
import type { Piece as PieceType } from "../types";
import { undoPiece } from "../logic/gameLogic";
import { Piece } from "./Piece";

export type BoardProps = {
  pieces: PieceType[];
  onUndo: (id: string) => void;
};

function BoardInner({ pieces, onUndo }: BoardProps) {
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUndo = useCallback(
    (id: string) => {
      const { result, blockerId } = undoPiece(pieces, id);

      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);

      if (result === "invalid" || result === "blocked") {
        setShakingId(id);
        shakeTimer.current = setTimeout(() => setShakingId(null), 400);
      }
      if (result === "blocked" && blockerId) {
        setHighlightedId(blockerId);
        highlightTimer.current = setTimeout(() => setHighlightedId(null), 600);
      }

      onUndo(id);
    },
    [pieces, onUndo],
  );

  return (
    <div
      className="mx-auto w-full max-w-[min(320px,90vw)] rounded-xl p-2 pt-6"
      style={{ backgroundColor: "#0D1B2A" }}
    >
      <div className="relative aspect-square w-full overflow-visible">
        <div
          className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2"
          aria-hidden
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md"
              style={{ backgroundColor: "#1C2B3A" }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 overflow-visible">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="pointer-events-auto relative z-10 min-h-[44px] min-w-[44px] overflow-visible"
              style={{
                gridColumn: piece.col + 1,
                gridRow: piece.row + 1,
              }}
            >
              <Piece
                piece={piece}
                onUndo={handleUndo}
                isShaking={piece.id === shakingId}
                isHighlighted={piece.id === highlightedId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Board = memo(BoardInner);
