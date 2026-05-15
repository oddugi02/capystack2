/** 9:16 모바일 세로 */
export interface ViewLayout {
  width: number;
  height: number;
  backY: number;
  backYHead: number;
  backYMid: number;
  backYTail: number;
  backLeft: number;
  backRight: number;
  /** 카피바라 가로 중심 (0~1, 화면 너비 비율) */
  capyCenterX: number;
  dropY: number;
  failY: number;
  stackBaseY: number;
  controlsBottom: number;
}

export type PlatformSegment = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
};

/** 카피바라 머리~등 쌓기 허용 구간 (화면 px) */
export interface StackZone {
  left: number;
  right: number;
  /** 등 바닥(파인) — 화면 Y, 아래로 갈수록 큼 */
  surfaceY: number;
}

export function computeLayout(width: number, height: number): ViewLayout {
  const controlsBottom = Math.max(64, height * 0.09);
  // 등(쌓기 면) — 큰 스프라이트 기준 (~50%)
  const backY = height * 0.5;
  const capyCenterX = 0.48;

  return {
    width,
    height,
    backY,
    backYHead: backY - height * 0.02,
    backYMid: backY - height * 0.03,
    backYTail: backY - height * 0.012,
    backLeft: width * 0.1,
    backRight: width * 0.9,
    capyCenterX,
    dropY: Math.max(72, height * 0.11),
    failY: height * 0.96,
    stackBaseY: backY - 28,
    controlsBottom,
  };
}

/** 3D 동기화 전 폴백 — 머리~등 구간만 */
export function fallbackPlatformSegments(w: number, v: ViewLayout): PlatformSegment[] {
  const h = 18;
  const cy = (y: number) => y + h * 0.5;
  const left = w * 0.38;
  const right = w * 0.78;
  const span = right - left;
  const y = v.backY;
  return [
    { x: left + span * 0.18, y: cy(y - 6), w: span * 0.32, h, angle: 0 },
    { x: left + span * 0.5, y: cy(y + 10), w: span * 0.36, h, angle: 0 },
    { x: right - span * 0.1, y: cy(y - 4), w: span * 0.3, h, angle: 0 },
  ];
}

export function fallbackStackZone(w: number, v: ViewLayout): StackZone {
  const cx = w * v.capyCenterX;
  const halfBody = w * 0.2;
  const pad = w * 0.035;
  return {
    left: cx - halfBody - pad,
    right: cx + halfBody + pad,
    surfaceY: v.backY + 8,
  };
}
