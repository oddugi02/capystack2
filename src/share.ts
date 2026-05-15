import type { GameScore, Records } from './types';
import { todayKey } from './daily';

export type ShareSnapshot = {
  scene?: HTMLCanvasElement;
  physics?: HTMLCanvasElement;
};

export function renderShareCard(
  canvas: HTMLCanvasElement,
  score: GameScore,
  records: Records,
  snapshot?: ShareSnapshot | HTMLCanvasElement,
) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  const layers: ShareSnapshot =
    snapshot instanceof HTMLCanvasElement
      ? { physics: snapshot }
      : (snapshot ?? {});

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const src = layers.scene ?? layers.physics;
  if (src) {
    const sw = src.width;
    const sh = src.height;
    const scale = Math.min((w - 48) / sw, (h * 0.52) / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const x = (w - dw) / 2;
    const y = 120;

    if (layers.scene) {
      ctx.drawImage(layers.scene, x, y, dw, dh);
    }
    if (layers.physics) {
      ctx.drawImage(layers.physics, x, y, dw, dh);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4a3f32';
  ctx.font = 'bold 28px "Noto Sans KR", sans-serif';
  ctx.fillText('카피바라 탑쌓기', w / 2, 72);

  ctx.font = '64px Jua, sans-serif';
  ctx.fillStyle = '#5a9e58';
  ctx.fillText(`${score.heightCm} cm`, w / 2, h * 0.72);

  ctx.font = '22px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#6b5f50';
  ctx.fillText(`${score.floors}층 · 최고 기록 ${records.allTime}cm`, w / 2, h * 0.78);

  ctx.font = '18px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#9a8d7c';
  ctx.fillText(`오늘의 챌린지 ${todayKey()}`, w / 2, h * 0.84);

  ctx.font = '16px Jua, sans-serif';
  ctx.fillStyle = '#b8956a';
  ctx.fillText('나도 도전해봐 🦫', w / 2, h * 0.91);
}
