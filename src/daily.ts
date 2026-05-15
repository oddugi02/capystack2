/** 날짜 키 — 오늘 최고 기록 등에서 사용 */
export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dailyChallengeLabel(): string {
  return '물건은 매번 무작위 — 최고 높이에 도전!';
}
