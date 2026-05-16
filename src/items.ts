import type { StackItemDef } from './types';

/** 쌓기 조각·스폰 크기 (1 = 설계 원본, 0.72 × 1.2) */
export const ITEM_SIZE_SCALE = 0.864;

const base = (
  id: string,
  name: string,
  matterKind: StackItemDef['matterKind'],
  width: number,
  height: number,
  color: string,
  extra?: Partial<StackItemDef>,
): StackItemDef => ({
  id,
  name,
  matterKind,
  width: Math.max(16, Math.round(width * ITEM_SIZE_SCALE)),
  height: Math.max(16, Math.round(height * ITEM_SIZE_SCALE)),
  color,
  stroke: '',
  ...extra,
});

/** Matter.js 물리 + 플랫 벡터 렌더 */
export const ITEM_POOL: StackItemDef[] = [
  // —— 기존 9종 ——
  base('yuzu', '유자', 'circle', 44, 44, '#ffb347'),
  base('white-towel', '흰수건', 'rect', 78, 28, '#eaeef3', { friction: 0.6 }),
  base('baby-capy', '아기 카피바라', 'circle', 48, 40, '#b8956a', {
    density: 0.001,
    friction: 0.55,
  }),
  base('bird', '새', 'compound-bird', 36, 28, '#8ecae6', {
    density: 0.00085,
    restitution: 0.1,
  }),
  base('duck', '오리', 'circle', 42, 38, '#ffe066'),
  base('monkey', '원숭이', 'circle', 44, 44, '#8d6e63'),
  base('basket', '나무바구니', 'trapezoid', 64, 40, '#a1887f', {
    density: 0.0014,
    friction: 0.62,
  }),
  base('pudding', '푸딩', 'trapezoid', 40, 44, '#d4a574', {
    density: 0.00125,
    friction: 0.5,
  }),
  base('golden', '황금유자', 'circle', 40, 40, '#ffd54f', {
    density: 0.0018,
    friction: 0.35,
    rare: true,
  }),

  // —— 과일·채소 ——
  base('tangerine', '귤', 'circle', 40, 40, '#ff9f43'),
  base('apple', '사과', 'circle', 44, 44, '#e74c3c'),
  base('strawberry', '딸기', 'circle', 38, 42, '#e74c5c'),
  base('watermelon', '수박', 'circle', 52, 44, '#2ecc71'),
  base('peach', '복숭아', 'circle', 44, 44, '#ffb5a7'),
  base('pear', '배', 'circle', 40, 46, '#d4e157'),
  base('tomato', '토마토', 'circle', 40, 40, '#e53935'),
  base('carrot', '당근', 'rect', 36, 48, '#ff8f00'),
  base('mushroom', '버섯', 'circle', 42, 40, '#efebe9'),
  base('corn', '옥수수', 'rect', 32, 48, '#ffeb3b'),
  base('sweet-potato', '고구마', 'circle', 48, 36, '#8d6e63'),
  base('chestnut', '밤', 'circle', 38, 38, '#6d4c41'),

  // —— 간식·음식 ——
  base('egg', '계란', 'circle', 36, 44, '#fff8e1'),
  base('melon-bread', '멜론빵', 'circle', 46, 38, '#d7a86e'),
  base('onigiri', '주먹밥', 'trapezoid', 40, 44, '#f5f5f5'),
  base('ramen', '라면', 'rect', 48, 40, '#ff7043'),
  base('fish', '생선', 'rect', 56, 32, '#90caf9'),
  base('mug', '머그컵', 'trapezoid', 38, 44, '#8d6e63'),
  base('soap', '비누', 'rect', 44, 32, '#b3e5fc'),

  // —— 자연·소품 ——
  base('leaf', '나뭇잎', 'rect', 52, 32, '#66bb6a'),
  base('flower', '꽃', 'circle', 42, 42, '#f48fb1'),
  base('shell', '조개', 'circle', 44, 36, '#ffccbc'),
  base('starfish', '불가사리', 'circle', 46, 44, '#ffab91'),
  base('bamboo', '죽순', 'rect', 28, 50, '#aed581'),
  base('book', '책', 'rect', 44, 36, '#5c6bc0'),
  base('pillow', '베개', 'rect', 64, 32, '#e1bee7'),
  base('hat', '모자', 'trapezoid', 52, 36, '#8d6e63'),

  // —— 희귀 ——
  base('golden-duck', '황금오리', 'circle', 42, 38, '#ffd700', {
    density: 0.0018,
    rare: true,
  }),
  base('rainbow-melon', '무지개멜론', 'circle', 50, 44, '#81c784', {
    density: 0.0016,
    rare: true,
  }),
];

export function getItemById(id: string): StackItemDef {
  return ITEM_POOL.find((i) => i.id === id) ?? ITEM_POOL[0];
}

/** 다음에 떨어질 물건 — 층마다 완전 무작위 */
export function pickRandomStackItem(): StackItemDef {
  const i = Math.floor(Math.random() * ITEM_POOL.length);
  return ITEM_POOL[i];
}
