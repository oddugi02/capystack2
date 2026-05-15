import Matter from 'matter-js';
import { drawItemVisual } from './itemRenderer';
import {
  computeLayout,
  fallbackPlatformSegments,
  fallbackStackZone,
  type PlatformSegment,
  type StackZone,
  type ViewLayout,
} from './layout';
import {
  computePlacement,
  layerWidth,
  type StackLayer,
} from './stackRules';
import type { StackItemDef } from './types';

export interface PlatformLayout {
  segments: { x: number; y: number; w: number; h: number; angle?: number }[];
  stackZone: StackZone;
  stackBaseY: number;
  dropY: number;
  failY: number;
}

export type StackBody = Matter.Body & {
  plugin: {
    stackItem?: StackItemDef;
    placed?: boolean;
    /** 이번 층 스폰·판정 높이 (bounds 미갱신 시 그리기/낙하에 사용) */
    spawnHeight?: number;
    /** 안착 후 남은 가로 범위 */
    stackSpan?: { left: number; right: number };
  };
};

const { Engine, World, Bodies, Body, Composite } = Matter;

function bodyOpts(item: StackItemDef) {
  return {
    friction: Math.max(item.friction ?? 0.5, 0.84),
    frictionStatic: 0.98,
    frictionAir: 0.02,
    restitution: item.restitution ?? 0.015,
    density: item.density ?? 0.0011,
    slop: 0.02,
    label: 'stack',
  };
}

/** Matter.js로 아이템별 복합/단일 바디 생성 */
export function buildMatterItem(item: StackItemDef, x: number, y: number): StackBody {
  const opts = bodyOpts(item);
  let body: StackBody;

  switch (item.matterKind) {
    case 'circle': {
      const r = Math.min(item.width, item.height) / 2;
      body = Bodies.circle(x, y, r, opts) as StackBody;
      break;
    }
    case 'rect': {
      body = Bodies.rectangle(x, y, item.width, item.height, {
        ...opts,
        chamfer: { radius: 8 },
      }) as StackBody;
      break;
    }
    case 'trapezoid': {
      body = Bodies.trapezoid(x, y, item.width, item.height, 0.45, opts) as StackBody;
      break;
    }
    case 'compound-bird': {
      // 복합체 관통 방지 — 물리는 단일 원, 비주얼만 새 모양
      body = Bodies.circle(x, y, 13, {
        ...opts,
        density: 0.001,
        friction: 0.8,
      }) as StackBody;
      break;
    }
    case 'compound-ramen': {
      const cup = Bodies.rectangle(0, 8, item.width * 0.82, item.height * 0.62, {
        ...opts,
        chamfer: { radius: 4 },
      });
      const rim = Bodies.rectangle(0, -14, item.width * 0.95, 10, opts);
      const lid = Bodies.rectangle(0, -20, item.width * 0.7, 6, opts);
      body = Body.create({ parts: [cup, rim, lid], ...opts }) as StackBody;
      Body.setPosition(body, { x, y });
      break;
    }
    case 'compound-towel': {
      const main = Bodies.rectangle(0, 0, item.width * 0.88, item.height * 0.65, {
        ...opts,
        chamfer: { radius: 6 },
      });
      const fold = Bodies.rectangle(-8, -4, item.width * 0.35, item.height * 0.5, {
        ...opts,
        chamfer: { radius: 4 },
      });
      body = Body.create({ parts: [main, fold], ...opts }) as StackBody;
      Body.setPosition(body, { x, y });
      break;
    }
    case 'polygon-stone': {
      const w = item.width / 2;
      const h = item.height / 2;
      const poly = [
        { x: -w * 0.9, y: h * 0.3 },
        { x: -w * 0.4, y: -h * 0.9 },
        { x: w * 0.7, y: -h * 0.7 },
        { x: w * 0.95, y: h * 0.2 },
        { x: w * 0.2, y: h * 0.85 },
      ];
      const fromV = Bodies.fromVertices(x, y, [poly], opts, true);
      body = (fromV || Bodies.circle(x, y, w * 0.85, opts)) as StackBody;
      break;
    }
    default: {
      body = Bodies.rectangle(x, y, item.width, item.height, opts) as StackBody;
    }
  }

  body.plugin = { stackItem: item, placed: false };
  return body;
}

export function layoutForSize(
  w: number,
  h: number,
  segments?: PlatformSegment[],
  stackZone?: StackZone,
): PlatformLayout {
  const v = computeLayout(w, h);
  const segs = segments ?? fallbackPlatformSegments(w, v);
  const zone = stackZone ?? fallbackStackZone(w, v);
  const segH = 18;
  const surfaceTop = (s: PlatformSegment) => s.y - (s.h ?? segH) * 0.5;
  const floorY = Math.max(...segs.map(surfaceTop), zone.surfaceY);

  return {
    stackZone: { ...zone, surfaceY: floorY },
    stackBaseY: floorY,
    dropY: v.dropY,
    failY: v.failY,
    segments: segs,
  };
}

export class PhysicsWorld {
  engine: Matter.Engine;
  world: Matter.World;
  platform: Matter.Body[] = [];
  capyColliders: Matter.Body[] = [];
  stackBodies: StackBody[] = [];
  worldOffsetY = 0;
  walls: Matter.Body[] = [];
  width = 0;
  height = 0;
  viewLayout: ViewLayout | null = null;
  layout: PlatformLayout = {
    segments: [],
    stackZone: { left: 0, right: 0, surfaceY: 0 },
    stackBaseY: 0,
    dropY: 0,
    failY: 0,
  };
  zoneWalls: Matter.Body[] = [];

  constructor() {
    this.engine = Engine.create({ enableSleeping: false });
    this.engine.positionIterations = 12;
    this.engine.velocityIterations = 10;
    this.engine.gravity.y = 1.15;
    this.world = this.engine.world;
  }

  resize(
    w: number,
    h: number,
    platformSegments?: PlatformSegment[],
    zone?: StackZone,
  ) {
    this.width = w;
    this.height = h;
    this.viewLayout = computeLayout(w, h);
    this.layout = layoutForSize(w, h, platformSegments, zone);

    Composite.remove(this.world, [
      ...this.platform,
      ...this.capyColliders,
      ...this.zoneWalls,
      ...this.walls,
    ]);
    this.platform = [];
    this.capyColliders = [];
    this.zoneWalls = [];
    this.walls = [];

    const { segments, failY } = this.layout;
    for (const seg of segments) {
      const b = Bodies.rectangle(seg.x, seg.y, seg.w, seg.h, {
        isStatic: true,
        angle: seg.angle ?? 0,
        friction: 0.9,
        frictionStatic: 0.96,
        restitution: 0.015,
        slop: 0.02,
        label: 'platform',
      }) as StackBody;
      this.platform.push(b);
    }

    const { stackZone } = this.layout;
    const wallH = h * 0.55;
    const wallY = stackZone.surfaceY + wallH * 0.35;
    const wallOpts = { isStatic: true, label: 'zone-wall', friction: 0.4 };
    this.zoneWalls = [
      Bodies.rectangle(stackZone.left - 6, wallY, 12, wallH, wallOpts),
      Bodies.rectangle(stackZone.right + 6, wallY, 12, wallH, wallOpts),
    ];

    const outerWallOpts = { isStatic: true, label: 'wall' };
    this.walls = [
      Bodies.rectangle(-20, h * 0.42, 40, h, outerWallOpts),
      Bodies.rectangle(w + 20, h * 0.42, 40, h, outerWallOpts),
      Bodies.rectangle(w * 0.5, failY + 50, w * 2, 50, { ...outerWallOpts, label: 'fail' }),
    ];

    World.add(this.world, [
      ...this.platform,
      ...this.zoneWalls,
      ...this.walls,
    ]);
  }

  /** 머리~등 구간에 안착했는지 (위에 쌓인 경우 포함) */
  isOnStackZone(body: StackBody): boolean {
    const { left, right } = this.layout.stackZone;
    const b = body.bounds;
    const pad = 6;

    const onX = b.max.x > left + pad && b.min.x < right - pad;
    if (!onX) return false;

    const floorY = this.layout.stackBaseY;
    if (b.max.y > floorY + 150) return false;

    return b.max.y > this.layout.dropY + 24;
  }

  clearStack() {
    Composite.remove(this.world, this.stackBodies);
    this.stackBodies = [];
    this.worldOffsetY = 0;
  }

  /** 카피 등 또는 맨 위 층 */
  getSupportLayer(): StackLayer {
    const placed = this.stackBodies.filter((b) => b.plugin.placed);
    if (placed.length === 0) {
      const z = this.layout.stackZone;
      const pad = layerWidth({ left: z.left, right: z.right, topY: 0 }) * 0.06;
      return {
        left: z.left + pad,
        right: z.right - pad,
        topY: z.firstLandingY ?? this.layout.stackBaseY,
      };
    }
    const top = placed[placed.length - 1];
    const span = top.plugin.stackSpan!;
    return { left: span.left, right: span.right, topY: top.bounds.min.y };
  }

  getSpawnWidth(): number {
    const w = layerWidth(this.getSupportLayer());
    return Math.min(this.width * 0.92, Math.max(88, w));
  }

  getLayerHeight(item: StackItemDef): number {
    return Math.max(28, Math.min(44, item.height));
  }

  /** 탑쌓기용 — 직사각형 충돌 + 아이템 비주얼 */
  createStackPiece(
    item: StackItemDef,
    x: number,
    y: number,
    width: number,
    height: number,
    isStatic = true,
  ): StackBody {
    const body = Bodies.rectangle(x, y, width, height, {
      ...bodyOpts(item),
      chamfer: { radius: 6 },
    }) as StackBody;
    body.plugin = {
      stackItem: item,
      placed: false,
      spawnWidth: width,
      spawnHeight: height,
    };
    if (isStatic) Body.setStatic(body, true);
    return body;
  }

  getLandingY(body: StackBody): number {
    const support = this.getSupportLayer();
    const bh = body.bounds.max.y - body.bounds.min.y;
    const h =
      bh > 2 ? bh : Math.max(body.plugin.spawnHeight ?? 0, this.getLayerHeight(body.plugin.stackItem!));
    return support.topY - h * 0.5;
  }

  placeStackPiece(body: StackBody) {
    const dropW = body.plugin.spawnWidth ?? body.bounds.max.x - body.bounds.min.x;
    const bh = body.bounds.max.y - body.bounds.min.y;
    const h =
      bh > 2 ? bh : Math.max(body.plugin.spawnHeight ?? 0, this.getLayerHeight(body.plugin.stackItem!));
    const support = this.getSupportLayer();
    const placement = computePlacement(body.position.x, dropW, h, support);

    if (!placement.ok) {
      return { ok: false as const };
    }

    // 그래픽 비율 유지 — 폭 줄이기로 Body.scale 하지 않음 (겹침은 stackSpan으로만 규칙 반영)

    Body.setPosition(body, { x: placement.centerX, y: placement.centerY });
    Body.setAngle(body, 0);
    Body.setVelocity(body, { x: 0, y: 0 });
    Body.setAngularVelocity(body, 0);
    Body.setStatic(body, true);

    body.plugin.placed = true;
    body.plugin.spawnWidth = dropW;
    body.plugin.stackSpan = { left: placement.left, right: placement.right };

    if (!this.stackBodies.includes(body)) {
      this.stackBodies.push(body);
    }
    if (!this.world.bodies.includes(body)) {
      World.add(this.world, body);
    }

    return {
      ok: true as const,
      perfect: placement.perfect,
      overhang: placement.overhang,
    };
  }

  shiftWorld(dy: number) {
    if (dy <= 0) return;
    this.worldOffsetY += dy;
    const all = [...this.stackBodies, ...this.platform];
    for (const b of all) {
      Body.setPosition(b, { x: b.position.x, y: b.position.y + dy });
    }
    this.layout.stackBaseY += dy;
    const z = this.layout.stackZone;
    this.layout.stackZone = {
      ...z,
      surfaceY: z.surfaceY + dy,
      firstLandingY: z.firstLandingY !== undefined ? z.firstLandingY + dy : undefined,
    };
  }

  removeBody(body: StackBody) {
    Composite.remove(this.world, body);
    this.stackBodies = this.stackBodies.filter((b) => b !== body);
  }

  getStackTopY(): number {
    let top = this.layout.stackBaseY;
    for (const b of this.stackBodies) {
      const minY = b.bounds.min.y;
      if (minY < top) top = minY;
    }
    return top;
  }

  getPlacedCount(): number {
    return this.stackBodies.filter((b) => b.plugin.placed).length;
  }

  step() {
    /* 탑쌓기는 키네마틱 낙하 — Matter 시뮬 최소화 */
  }

  addToWorld(body: StackBody) {
    World.add(this.world, body);
  }
}

/** Matter.js 바디 위에 아이템별 비주얼 렌더 */
export function drawMatterBody(
  ctx: CanvasRenderingContext2D,
  body: StackBody,
  alpha = 1,
) {
  drawItemVisual(ctx, body, alpha);
}
