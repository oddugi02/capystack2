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

/** 카피바라 머리~등 기준선 (화면 px, Y는 아래로 증가) */
export interface StackLandmarks {
  /** 머리 윗경계선 */
  headTopY: number;
  /** 머리·등 연결부 파인 윗경계선 (목 융기) */
  dipCrestY: number;
  /** 등 윗경계선 (어깨·등 시작) */
  backTopY: number;
}

/** 카피바라 머리~등 쌓기 허용 구간 (화면 px, Y는 아래로 증가) */
export interface StackZone {
  left: number;
  right: number;
  /** 등 안장 바닥(파인 최하단) — 높이·점수 기준 */
  surfaceY: number;
  /** 첫 조각 밑면이 닿는 높이 = dipCrestY */
  firstLandingY?: number;
  landmarks?: StackLandmarks;
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
  const headTopY = v.backY - Math.max(v.height * 0.11, 52);
  const dipCrestY = v.backY - Math.max(v.height * 0.045, 28);
  const backTopY = v.backY - Math.max(v.height * 0.028, 16);
  const saddleFloorY = v.backY + 8;
  return {
    left: cx - halfBody - pad,
    right: cx + halfBody + pad,
    surfaceY: saddleFloorY,
    firstLandingY: dipCrestY,
    landmarks: { headTopY, dipCrestY, backTopY },
  };
}
