import { ITEM_POOL } from './items';
import type { StackItemDef } from './types';

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dailySeed(): number {
  return hashString(`capy-stack-${todayKey()}`);
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDailySequence(count = 40): StackItemDef[] {
  const rand = mulberry32(dailySeed());
  const normal = ITEM_POOL.filter((i) => !i.rare);
  const rare = ITEM_POOL.filter((i) => i.rare);
  const seq: StackItemDef[] = [];

  for (let i = 0; i < count; i++) {
    if (rand() < 0.08 && rare.length) {
      seq.push(rare[Math.floor(rand() * rare.length)]);
    } else {
      seq.push(normal[Math.floor(rand() * normal.length)]);
    }
  }
  return seq;
}

export function dailyChallengeLabel(): string {
  const seed = dailySeed();
  return `오늘의 챌린지 #${(seed % 9000) + 1000} — 같은 순서로 기록 겨루기`;
}
