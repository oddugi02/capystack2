/** 한 층의 가로 지지 범위 (화면 px, y는 아래로 증가) */
export interface StackLayer {
  left: number;
  right: number;
  topY: number;
}

export const MIN_OVERLAP_PX = 14;
export const PERFECT_ALIGN_PX = 10;

export function layerWidth(layer: StackLayer): number {
  return layer.right - layer.left;
}

export function overlap(
  a: { left: number; right: number },
  b: { left: number; right: number },
): number {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
}

export type PlacementResult =
  | {
      ok: true;
      left: number;
      right: number;
      centerX: number;
      centerY: number;
      width: number;
      perfect: boolean;
      overhang: number;
    }
  | { ok: false };

/** Stack / Tower 스타일 — 삐져나간 부분은 잘리고 겹친 폭만 남김 */
export function computePlacement(
  dropCenterX: number,
  dropWidth: number,
  pieceHeight: number,
  support: StackLayer,
): PlacementResult {
  const half = dropWidth * 0.5;
  const drop = { left: dropCenterX - half, right: dropCenterX + half };
  const left = Math.max(drop.left, support.left);
  const right = Math.min(drop.right, support.right);
  const width = right - left;

  if (width < MIN_OVERLAP_PX) return { ok: false };

  const centerX = (left + right) / 2;
  const centerY = support.topY - pieceHeight * 0.5;
  const supportCenter = (support.left + support.right) * 0.5;
  const perfect = Math.abs(centerX - supportCenter) <= PERFECT_ALIGN_PX;
  const overhang = dropWidth - width;

  return {
    ok: true,
    left,
    right,
    centerX,
    centerY,
    width,
    perfect,
    overhang,
  };
}
