/** 게임 캔버스 — 레이아웃 뷰포트 기준 (Chrome 모바일 미리보기 호환) */
export function getGameSize(): { width: number; height: number } {
  const el = document.documentElement;
  const w = Math.round(window.innerWidth || el.clientWidth);
  const h = Math.round(window.innerHeight || el.clientHeight);
  return { width: Math.max(320, w), height: Math.max(480, h) };
}
