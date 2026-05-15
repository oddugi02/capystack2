import type { StackItemDef } from './types';

/** Matter.js 물리 + 플랫 벡터 렌더 */
export const ITEM_POOL: StackItemDef[] = [
  {
    id: 'yuzu',
    name: '유자',
    matterKind: 'circle',
    width: 44,
    height: 44,
    color: '#ffb347',
    stroke: '',
    density: 0.0012,
  },
  {
    id: 'white-towel',
    name: '흰수건',
    matterKind: 'rect',
    width: 78,
    height: 28,
    color: '#f5f5f5',
    stroke: '',
    friction: 0.6,
  },
  {
    id: 'baby-capy',
    name: '아기 카피바라',
    matterKind: 'circle',
    width: 48,
    height: 40,
    color: '#b8956a',
    stroke: '',
    density: 0.001,
    friction: 0.55,
  },
  {
    id: 'bird',
    name: '새',
    matterKind: 'compound-bird',
    width: 36,
    height: 28,
    color: '#8ecae6',
    stroke: '',
    density: 0.00085,
    restitution: 0.1,
  },
  {
    id: 'duck',
    name: '오리',
    matterKind: 'circle',
    width: 42,
    height: 38,
    color: '#ffe066',
    stroke: '',
    density: 0.0011,
  },
  {
    id: 'monkey',
    name: '원숭이',
    matterKind: 'circle',
    width: 44,
    height: 44,
    color: '#8d6e63',
    stroke: '',
    density: 0.00115,
  },
  {
    id: 'basket',
    name: '나무바구니',
    matterKind: 'trapezoid',
    width: 64,
    height: 40,
    color: '#a1887f',
    stroke: '',
    density: 0.0014,
    friction: 0.62,
  },
  {
    id: 'pudding',
    name: '푸딩',
    matterKind: 'trapezoid',
    width: 40,
    height: 44,
    color: '#d4a574',
    stroke: '',
    density: 0.00125,
    friction: 0.5,
  },
  {
    id: 'golden',
    name: '황금유자',
    matterKind: 'circle',
    width: 40,
    height: 40,
    color: '#ffd54f',
    stroke: '',
    density: 0.0018,
    friction: 0.35,
    rare: true,
  },
];

export function getItemById(id: string): StackItemDef {
  return ITEM_POOL.find((i) => i.id === id) ?? ITEM_POOL[0];
}

/** 다음에 떨어질 물건 — 게임마다·층마다 완전 무작위 */
export function pickRandomStackItem(): StackItemDef {
  const i = Math.floor(Math.random() * ITEM_POOL.length);
  return ITEM_POOL[i];
}
