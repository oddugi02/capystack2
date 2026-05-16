import type { StackItemDef } from './types';
import type { StackBody } from './physics';

/** Matter 바디(또는 안착 후 stackSpan) 안에 아이템 비율 유지해 맞춤 */
function visualDrawSize(body: StackBody): { w: number; h: number } {
  const item = body.plugin.stackItem;
  const b = body.bounds;
  let boxW = Math.max(0, b.max.x - b.min.x);
  let boxH = Math.max(0, b.max.y - b.min.y);

  if (!item) {
    return { w: Math.max(boxW, 8), h: Math.max(boxH, 8) };
  }

  const span = body.plugin.stackSpan;
  if (span) {
    boxW = span.right - span.left;
  } else if (body.plugin.spawnWidth) {
    boxW = body.plugin.spawnWidth;
  }

  if (boxW < 2 || !Number.isFinite(boxW)) {
    boxW = Math.max(item.width, body.plugin.spawnWidth ?? item.width);
  }
  if (boxH < 2 || !Number.isFinite(boxH)) {
    boxH = body.plugin.spawnHeight ?? item.height;
  }

  const iw = item.width;
  const ih = Math.max(item.height, 1);
  const scale = Math.min(boxW / iw, boxH / ih) * 1.03;
  return {
    w: Math.max(iw * scale, 8),
    h: Math.max(ih * scale, 8),
  };
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
  const px = body.position.x;
  const py = body.position.y;
  if (!Number.isFinite(px) || !Number.isFinite(py) || w < 1 || h < 1) {
    ctx.restore();
    return;
  }

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
    case 'tangerine':
      drawTangerine(ctx, w, h);
      break;
    case 'apple':
      drawApple(ctx, w, h);
      break;
    case 'strawberry':
      drawStrawberry(ctx, w, h);
      break;
    case 'watermelon':
      drawWatermelon(ctx, w, h);
      break;
    case 'peach':
      drawPeach(ctx, w, h);
      break;
    case 'pear':
      drawPear(ctx, w, h);
      break;
    case 'tomato':
      drawTomato(ctx, w, h);
      break;
    case 'carrot':
      drawCarrot(ctx, w, h);
      break;
    case 'mushroom':
      drawMushroom(ctx, w, h);
      break;
    case 'corn':
      drawCorn(ctx, w, h);
      break;
    case 'sweet-potato':
      drawSweetPotato(ctx, w, h);
      break;
    case 'chestnut':
      drawChestnut(ctx, w, h);
      break;
    case 'egg':
      drawEgg(ctx, w, h);
      break;
    case 'melon-bread':
      drawMelonBread(ctx, w, h);
      break;
    case 'onigiri':
      drawOnigiri(ctx, w, h);
      break;
    case 'ramen':
      drawRamen(ctx, w, h);
      break;
    case 'fish':
      drawFish(ctx, w, h);
      break;
    case 'mug':
      drawMug(ctx, w, h);
      break;
    case 'soap':
      drawSoap(ctx, w, h);
      break;
    case 'leaf':
      drawLeaf(ctx, w, h);
      break;
    case 'flower':
      drawFlower(ctx, w, h);
      break;
    case 'shell':
      drawShell(ctx, w, h);
      break;
    case 'starfish':
      drawStarfish(ctx, w, h);
      break;
    case 'bamboo':
      drawBamboo(ctx, w, h);
      break;
    case 'book':
      drawBook(ctx, w, h);
      break;
    case 'pillow':
      drawPillow(ctx, w, h);
      break;
    case 'hat':
      drawHat(ctx, w, h);
      break;
    case 'golden-duck':
      drawDuck(ctx, w, h, true);
      break;
    case 'rainbow-melon':
      drawRainbowMelon(ctx, w, h);
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

function drawDuck(ctx: CanvasRenderingContext2D, w: number, h: number, golden = false) {
  ctx.fillStyle = golden ? '#ffd700' : '#ffe066';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = golden ? '#ffecb3' : '#ffcc00';
  ctx.beginPath();
  ctx.arc(w * 0.22, -h * 0.12, w * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = golden ? '#ffc107' : '#ff9800';
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

function drawTangerine(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rx = w * 0.44;
  const ry = h * 0.44;
  ctx.fillStyle = '#ff9f43';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb74d';
  ctx.beginPath();
  ctx.ellipse(-rx * 0.25, -ry * 0.2, rx * 0.15, ry * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#43a047';
  ctx.fillRect(-2, -ry * 0.95, 3, 5);
}

function drawApple(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = w * 0.42;
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(0, h * 0.04, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -h * 0.15, r * 0.2, r * 0.12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(-2, -r * 1.05, 3, 6);
}

function drawStrawberry(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e74c5c';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.42);
  ctx.lineTo(-w * 0.38, -h * 0.1);
  ctx.lineTo(0, -h * 0.38);
  ctx.lineTo(w * 0.38, -h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8bbd0';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * w * 0.12, i * h * 0.08, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.42);
  ctx.lineTo(-w * 0.12, -h * 0.52);
  ctx.lineTo(w * 0.12, -h * 0.52);
  ctx.closePath();
  ctx.fill();
}

function drawWatermelon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b5e20';
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e53935';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * w * 0.28, Math.sin(a) * h * 0.22, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPeach(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rx = w * 0.44;
  const ry = h * 0.44;
  ctx.fillStyle = '#ffb5a7';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffccbc';
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.25, rx * 0.18, ry * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(-1, -ry * 0.95, 2, 5);
}

function drawPear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#d4e157';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.06, w * 0.36, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.18, w * 0.28, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#827717';
  ctx.fillRect(-1, -h * 0.48, 2, 5);
}

function drawTomato(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = w * 0.4;
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.arc(0, h * 0.05, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.lineTo(-w * 0.08, -r * 1.1);
  ctx.lineTo(w * 0.08, -r * 1.1);
  ctx.closePath();
  ctx.fill();
}

function drawCarrot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ff8f00';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.45);
  ctx.lineTo(-w * 0.22, h * 0.42);
  ctx.lineTo(w * 0.22, h * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.38, w * 0.28, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMushroom(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#efebe9';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.12, w * 0.18, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.12, w * 0.42, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-w * 0.15, -h * 0.18, w * 0.1, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.12, -h * 0.08, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCorn(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffeb3b';
  roundRect(ctx, -w * 0.28, -h * 0.38, w * 0.56, h * 0.76, 6);
  ctx.fill();
  ctx.fillStyle = '#43a047';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillRect(
        -w * 0.22 + col * w * 0.14,
        -h * 0.3 + row * h * 0.14,
        w * 0.08,
        h * 0.08,
      );
    }
  }
}

function drawSweetPotato(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.46, h * 0.36, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a1887f';
  ctx.beginPath();
  ctx.ellipse(-w * 0.15, -h * 0.05, w * 0.12, h * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawChestnut(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#6d4c41';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.38, h * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.42);
  ctx.quadraticCurveTo(w * 0.2, -h * 0.2, 0, -h * 0.05);
  ctx.quadraticCurveTo(-w * 0.2, -h * 0.2, 0, -h * 0.42);
  ctx.fill();
}

function drawEgg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fff8e1';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.34, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe082';
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.15, w * 0.1, h * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMelonBread(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = Math.min(w * 0.44, h * 0.42);
  ctx.fillStyle = '#d7a86e';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#bcaaa4';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
    ctx.stroke();
  }
}

function drawOnigiri(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.42);
  ctx.lineTo(-w * 0.38, h * 0.38);
  ctx.lineTo(w * 0.38, h * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#424242';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.12, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRamen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.15, w * 0.42, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.02, w * 0.36, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffb74d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.15, h * 0.08);
  ctx.quadraticCurveTo(0, -h * 0.05, w * 0.15, h * 0.08);
  ctx.stroke();
}

function drawFish(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#90caf9';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.42, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#64b5f6';
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, 0);
  ctx.lineTo(-w * 0.55, -h * 0.12);
  ctx.lineTo(-w * 0.55, h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(w * 0.15, -h * 0.06, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMug(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8d6e63';
  roundRect(ctx, -w * 0.32, -h * 0.28, w * 0.64, h * 0.56, 4);
  ctx.fill();
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(w * 0.38, 0, w * 0.12, h * 0.18, 0, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.strokeStyle = '#efebe9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(w * 0.38, 0, w * 0.1, h * 0.15, 0, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = '#bcaaa4';
  ctx.fillRect(-w * 0.32, -h * 0.34, w * 0.64, h * 0.08);
}

function drawSoap(ctx: CanvasRenderingContext2D, w: number, h: number) {
  roundRect(ctx, -w / 2, -h / 2, w, h, 6);
  ctx.fillStyle = '#b3e5fc';
  ctx.fill();
  ctx.fillStyle = '#81d4fa';
  roundRect(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, h * 0.35, 4);
  ctx.fill();
}

function drawLeaf(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#66bb6a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w * 0.05, -h * 0.42);
  ctx.lineTo(w * 0.05, -h * 0.42);
  ctx.closePath();
  ctx.fill();
}

function drawFlower(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const petal = w * 0.14;
  ctx.fillStyle = '#f48fb1';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * w * 0.22,
      Math.sin(a) * h * 0.22,
      petal,
      petal * 0.7,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawShell(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffccbc';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.05, w * 0.4, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffab91';
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, i * h * 0.08);
    ctx.quadraticCurveTo(0, i * h * 0.12 + h * 0.05, w * 0.35, i * h * 0.08);
    ctx.stroke();
  }
}

function drawStarfish(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffab91';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * w * 0.42;
    const y = Math.sin(a) * h * 0.42;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff8a65';
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawBamboo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#aed581';
  roundRect(ctx, -w * 0.22, -h * 0.45, w * 0.44, h * 0.9, 4);
  ctx.fill();
  ctx.fillStyle = '#7cb342';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(-w * 0.24, i * h * 0.22, w * 0.48, 3);
  }
}

function drawBook(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#5c6bc0';
  roundRect(ctx, -w / 2, -h / 2, w, h, 3);
  ctx.fill();
  ctx.fillStyle = '#7986cb';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w * 0.35, h - 6);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-w / 2 + 8, -h / 2 + 8 + i * 6, w * 0.25, 2);
  }
}

function drawPillow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e1bee7';
  roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.35);
  ctx.fill();
  ctx.fillStyle = '#ce93d8';
  roundRect(ctx, -w / 2 + 6, -h / 2 + 4, w - 12, h - 8, h * 0.25);
  ctx.fill();
}

function drawHat(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.12, w * 0.48, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, -w * 0.28, -h * 0.38, w * 0.56, h * 0.42, 6);
  ctx.fill();
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(-w * 0.08, -h * 0.42, w * 0.16, h * 0.12);
}

function drawRainbowMelon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const colors = ['#81c784', '#fff176', '#ffb74d', '#f06292'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.ellipse(0, 0, w * (0.48 - i * 0.08), h * (0.42 - i * 0.07), 0, 0, Math.PI * 2);
    ctx.fill();
  }
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
