import type { Direction } from "../types";

/** Literal path labels shown on the stack (matches undoPath strings). */
export const PATH_ARROW: Record<Direction, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

export function pathStackLabel(path: Direction[]): string {
  if (path.length === 0) return "no moves left";
  const arrows = path.map((d) => PATH_ARROW[d]).join(" ");
  return `stack ${arrows}, next move ${PATH_ARROW[path[0]!]}`;
}
