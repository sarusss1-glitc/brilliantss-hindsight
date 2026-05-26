import type { Direction } from "../types";
import {
  getUndoTargetFromPosition,
  isOutOfBounds,
} from "./gameLogic";

/** True if this piece can clear itself on an empty board. */
export function canClearSolo(
  row: number,
  col: number,
  undoPath: Direction[],
): boolean {
  let r = row;
  let c = col;
  let path = [...undoPath];

  while (path.length > 0) {
    const target = getUndoTargetFromPosition(r, c, path[0]);

    if (isOutOfBounds(target.row, target.col)) {
      return path.length === 1;
    }

    path = path.slice(1);
    if (path.length === 0) return false;
    r = target.row;
    c = target.col;
  }

  return false;
}
