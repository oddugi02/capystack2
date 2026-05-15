import type { StackItemDef } from './types';
import type { StackBody } from './physics';

/** Matter 바디는 쌓기 판정 때문에 가로가 길 수 있음 — 그림은 item 비율 유지, 박스 안에 맞춤 */
function visualDrawSize(body: StackBody): { w: number; h: number } {
  const item = body.plugin.stackItem;
  const b = body.bounds;
  let bw = Math.max(0, b.max.x - b.min.x);
  let bh = Math.max(0, b.max.y - b.min.y);

  if (!item) {
    return { w: Math.max(bw, 8), h: Math.max(bh, 8) };
  }

  if (bw < 2 || bh < 2 || !Number.isFinite(bw)) {
    bw = Math.max(body.plugin.spawnWidth ?? item.width, item.width);
    bh = Math.max(28, Math.min(44, item.height));
  }

  const iw = item.width;
  const ih = Math.max(item.height, 1);
  const scale = Math.min(bw / iw, bh / ih);
  return {
    w: Math.max(iw * scale, 6),
    h: Math.max(ih * scale, 6),
  };
}

/** 흰 배경 위 연한색 아이템이 사라져 보이지 않도록 통일 접지 그림자 */
function drawGroundShadow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(26, 26, 26, 0.11)';
  ctx.beginPath();
  ctx.ellipse(1, h * 0.42, w * 0.5 + 2, Math.max(h * 0.2, 5), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Matter.js 바디 위 — 윤곽선 없는 플랫 벡터 도형 */
export function drawItemVisual(
  ctx: CanvasRenderingContext2D,
  body: StackBody,
  alpha = 1,
) {
  const item = body.plugin.stackItem;
  if (!item) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  const { w, h } = visualDrawSize(body);
  drawGroundShadow(ctx, w, h);

  switch (item.id) {
    case 'yuzu':
      drawYuzu(ctx, w, h, false);
      break;
    case 'golden':
      drawYuzu(ctx, w, h, true);
      break;
    case 'white-towel':
      drawWhiteTowel(ctx, w, h);
      break;
    case 'baby-capy':
      drawBabyCapy(ctx, w, h);
      break;
    case 'bird':
      drawBird(ctx, w, h);
      break;
    case 'duck':
      drawDuck(ctx, w, h);
      break;
    case 'monkey':
      drawMonkey(ctx, w, h);
      break;
    case 'basket':
      drawBasket(ctx, w, h);
      break;
    case 'pudding':
      drawPudding(ctx, w, h);
      break;
    default:
      drawFallback(ctx, w, h, item);
  }

  if (item.rare) {
    ctx.fillStyle = 'rgba(255, 230, 120, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.58, h * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawYuzu(ctx: CanvasRenderingContext2D, w: number, h: number, golden: boolean) {
  const rx = w * 0.46;
  const ry = h * 0.48;

  ctx.fillStyle = golden ? '#ffd54f' : '#ffb347';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = golden ? '#ffe082' : '#ffc870';
  ctx.beginPath();
  ctx.ellipse(-rx * 0.28, -ry * 0.32, rx * 0.2, ry * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7bc96f';
  ctx.beginPath();
  ctx.ellipse(rx * 0.2, -ry * 0.92, rx * 0.18, ry * 0.1, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawWhiteTowel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  roundRect(ctx, -w / 2, -h / 2, w, h, 5);
  /** 순백(#fafafa)은 화면 배경(#fff)과 거의 동일하여 보이지 않음 */
  ctx.fillStyle = '#eaeef3';
  ctx.fill();

  ctx.fillStyle = '#dfe5ec';
  roundRect(ctx, -w / 2 + 4, -h / 2, w * 0.3, h, 4);
  ctx.fill();

  ctx.fillStyle = '#e0e0e0';
  for (let i = 1; i <= 2; i++) {
    const x = -w / 2 + (w / 3) * i;
    ctx.fillRect(x, -h / 2 + 3, 2, h - 6);
  }
}

function drawBabyCapy(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#c4a882';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.06, w * 0.42, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a08060';
  ctx.beginPath();
  ctx.ellipse(-w * 0.28, -h * 0.08, w * 0.22, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8a6848';
  ctx.beginPath();
  ctx.ellipse(-w * 0.42, h * 0.02, w * 0.12, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2e2824';
  ctx.beginPath();
  ctx.arc(-w * 0.34, -h * 0.12, w * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9a7654';
  ctx.beginPath();
  ctx.ellipse(w * 0.1, h * 0.22, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-w * 0.05, h * 0.24, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8ecae6';
  ctx.beginPath();
  ctx.arc(-w * 0.05, 0, w * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#6eb5d8';
  ctx.beginPath();
  ctx.arc(w * 0.2, -h * 0.1, w * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.moveTo(w * 0.38, -h * 0.08);
  ctx.lineTo(w * 0.52, -h * 0.02);
  ctx.lineTo(w * 0.38, h * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1d3557';
  ctx.beginPath();
  ctx.arc(w * 0.26, -h * 0.14, w * 0.045, 0, Math.PI * 2);
  ctx.fill();
}

function drawDuck(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffe066';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(w * 0.22, -h * 0.12, w * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff9800';
  ctx.beginPath();
  ctx.moveTo(w * 0.38, -h * 0.08);
  ctx.lineTo(w * 0.55, -h * 0.02);
  ctx.lineTo(w * 0.38, h * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(w * 0.28, -h * 0.16, w * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawMonkey(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d7ccc8';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.28, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#6d4c41';
  ctx.beginPath();
  ctx.arc(-w * 0.32, -h * 0.2, w * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.32, -h * 0.2, w * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(-w * 0.1, -h * 0.02, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.1, -h * 0.02, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

function drawBasket(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#a1887f';
  ctx.beginPath();
  ctx.moveTo(-w * 0.38, h / 2);
  ctx.lineTo(-w * 0.28, -h / 2);
  ctx.lineTo(w * 0.28, -h / 2);
  ctx.lineTo(w * 0.38, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#8d6e63';
  for (let i = 0; i < 4; i++) {
    const y = -h / 2 + (h / 3.5) * i;
    ctx.fillRect(-w * 0.32, y, w * 0.64, h * 0.06);
  }

  ctx.fillStyle = '#bcaaa4';
  ctx.fillRect(-w * 0.34, -h / 2 - 2, w * 0.68, h * 0.12);
}

function drawPudding(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cupH = h * 0.55;

  ctx.fillStyle = '#d4a574';
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, h / 2);
  ctx.lineTo(-w * 0.3, h / 2 - cupH);
  ctx.lineTo(w * 0.3, h / 2 - cupH);
  ctx.lineTo(w * 0.34, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fff8e7';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 - cupH, w * 0.36, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffcc80';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 - cupH - h * 0.06, w * 0.14, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFallback(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  item: StackItemDef,
) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
