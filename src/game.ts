import { dailyChallengeLabel } from './daily';
import { pickRandomStackItem } from './items';
import type { GamePhase, GameScore, StackItemDef } from './types';
import { CapybaraScene } from './capybara3d';
import { computeLayout, fallbackStackZone } from './layout';
import { getGameSize } from './viewport';
import Matter from 'matter-js';
import {
  PhysicsWorld,
  drawMatterBody,
  type StackBody,
} from './physics';
import {
  dom,
  hideEndOverlay,
  hidePreview,
  loadRecords,
  saveRecords,
  setDropEnabled,
  setPreview,
  showEndOverlay,
  showStatus,
  updateHud,
} from './ui';
import { renderShareCard } from './share';

const CM_PER_PX = 0.42;
const BASE_AIM_SPEED = 0.00112;
const AIM_SPEED_PER_FLOOR = 0.00009;
const FALL_SPEED = 22;
const CAMERA_TOP_RATIO = 0.3;
const COMBO_SHOW_MS = 700;

export class Game {
  private scene3d: CapybaraScene;
  private physics: PhysicsWorld;
  private sceneCanvas: HTMLCanvasElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private phase: GamePhase = 'intro';
  private previewBody: StackBody | null = null;
  private fallingBody: StackBody | null = null;
  private fallTargetY = 0;
  private aimX = 0;
  private score: GameScore = { floors: 0, heightCm: 0 };
  private records = loadRecords();
  private raf = 0;
  private perfectStreak = 0;
  private audioCtx: AudioContext | null = null;
  /** 현재 노리고 있는 다음 조각(리사이즈·씬 동기에는 유지, 착지만 새로 랜덤) */
  private pendingPreviewItem: StackItemDef | null = null;

  constructor(
    sceneCanvas: HTMLCanvasElement,
    physicsCanvas: HTMLCanvasElement,
  ) {
    this.sceneCanvas = sceneCanvas;
    this.canvas = physicsCanvas;
    this.ctx = physicsCanvas.getContext('2d')!;
    this.scene3d = new CapybaraScene(sceneCanvas);
    this.physics = new PhysicsWorld();

    this.scene3d.onLayoutChanged = () => this.syncSceneLayoutToPhysics();

    dom.introDaily.textContent = dailyChallengeLabel();
    this.bindEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  /** 카피 텍스처 로드 후 스택 존 변경 → 물리·미리보기 재동기화 */
  private resolveStackZone(w: number, h: number) {
    const layout = computeLayout(w, h);
    const z = this.scene3d.getStackZone();
    return z.right > z.left + 8 ? z : fallbackStackZone(w, layout);
  }

  private syncSceneLayoutToPhysics() {
    const { width: w, height: h } = getGameSize();
    const layout = computeLayout(w, h);
    const platform = this.scene3d.getStackPlatform(layout);
    this.physics.resize(w, h, platform, this.resolveStackZone(w, h));
    if (this.phase === 'aiming') {
      this.spawnPreview(false);
    }
  }

  private bindEvents() {
    dom.btnStart.addEventListener('click', () => this.startGame());
    dom.btnDrop.addEventListener('click', () => this.drop());
    dom.btnStop.addEventListener('click', () => {
      if (this.phase === 'aiming' && this.score.floors > 0) this.endGame();
    });
    dom.btnRetry.addEventListener('click', () => this.startGame());
    dom.btnShare.addEventListener('click', () => this.openShare());
    dom.btnShareModal.addEventListener('click', () => this.openShare());
    dom.btnCloseShare.addEventListener('click', () => {
      dom.shareModal.hidden = true;
    });

    this.canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (this.phase !== 'aiming') return;
        if ((e.target as HTMLElement).closest('.controls')) return;
        this.drop();
      },
      { passive: true },
    );
  }

  private resize() {
    const app = document.getElementById('app')!;
    const { width: w, height: h } = getGameSize();
    const dpr = Math.min(window.devicePixelRatio, 2);

    app.style.width = `${w}px`;
    app.style.height = `${h}px`;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sceneCanvas = document.getElementById('scene-3d') as HTMLCanvasElement;
    sceneCanvas.width = w * dpr;
    sceneCanvas.height = h * dpr;
    sceneCanvas.style.width = `${w}px`;
    sceneCanvas.style.height = `${h}px`;

    const layout = computeLayout(w, h);
    app.style.setProperty('--controls-offset', `${layout.controlsBottom}px`);
    this.scene3d.resize(w, h);
    this.scene3d.setLayout(layout);
    const platform = this.scene3d.getStackPlatform(layout);
    this.physics.resize(w, h, platform, this.resolveStackZone(w, h));

    if (this.phase === 'aiming') {
      this.spawnPreview(false);
    }
  }

  startGame() {
    hideEndOverlay();
    dom.shareModal.hidden = true;
    dom.intro.hidden = true;
    dom.btnShare.hidden = true;
    dom.btnStop.hidden = false;

    this.physics.clearStack();
    this.scene3d.resetWorldScroll();
    const { width: w, height: h } = getGameSize();
    const layout = computeLayout(w, h);
    this.scene3d.setLayout(layout);
    const platform = this.scene3d.getStackPlatform(layout);
    this.physics.resize(w, h, platform, this.resolveStackZone(w, h));

    this.score = { floors: 0, heightCm: 0 };
    this.perfectStreak = 0;
    this.fallingBody = null;
    this.records = loadRecords();
    updateHud(this.score, this.records);

    this.phase = 'aiming';
    this.spawnPreview(true);
    setDropEnabled(true);
    showStatus('좌우로 움직일 때 탭!');
  }

  private aimSpeed() {
    return BASE_AIM_SPEED + this.score.floors * AIM_SPEED_PER_FLOOR;
  }

  private previewDropY(body: StackBody): number {
    const support = this.physics.getSupportLayer();
    const bh = body.bounds.max.y - body.bounds.min.y;
    const h =
      bh > 2
        ? bh
        : Math.max(
            body.plugin.spawnHeight ?? 0,
            this.physics.getLayerHeight(body.plugin.stackItem!),
          );
    return Math.max(this.physics.layout.dropY, support.topY - h - 4);
  }

  /** @param reroll 새 랜덤 조각(시작·착지만 true). 리사이즈·씬 동기에서는 false 로 태그·조각 고정 */
  private spawnPreview(reroll: boolean) {
    if (reroll || !this.pendingPreviewItem) {
      this.pendingPreviewItem = pickRandomStackItem();
    }

    const item = this.pendingPreviewItem;
    if (this.previewBody) {
      this.physics.removeBody(this.previewBody);
      this.previewBody = null;
    }

    const zone = this.physics.layout.stackZone;
    const spawnW = this.physics.getSpawnWidth();
    const spawnH = this.physics.getLayerHeight(item);
    this.aimX = (zone.left + zone.right) / 2;

    this.previewBody = this.physics.createStackPiece(
      item,
      this.aimX,
      this.physics.layout.dropY,
      spawnW,
      spawnH,
      true,
    );
    const dropY = this.previewDropY(this.previewBody);
    Matter.Body.setPosition(this.previewBody, { x: this.aimX, y: dropY });
    this.physics.addToWorld(this.previewBody);

    setPreview(this.aimX, dropY, item.name, item.color);
  }

  private syncPreviewPosition() {
    if (!this.previewBody) return;
    const item = this.previewBody.plugin.stackItem!;
    const zone = this.physics.layout.stackZone;
    const bw =
      this.previewBody.plugin.spawnWidth ??
      this.previewBody.bounds.max.x - this.previewBody.bounds.min.x;
    const margin = bw * 0.5;
    this.aimX = Math.max(zone.left + margin, Math.min(zone.right - margin, this.aimX));

    const dropY = this.previewDropY(this.previewBody);
    Matter.Body.setPosition(this.previewBody, { x: this.aimX, y: dropY });
    setPreview(this.aimX, dropY, item.name, item.color);
  }

  private updateAim() {
    if (!this.previewBody) return;

    const zone = this.physics.layout.stackZone;
    const bw =
      this.previewBody.plugin.spawnWidth ??
      this.previewBody.bounds.max.x - this.previewBody.bounds.min.x;
    const margin = bw * 0.5;
    const center = (zone.left + zone.right) / 2;
    const range = Math.max(0, zone.right - zone.left - margin * 2);
    const t = performance.now() * this.aimSpeed();

    this.aimX = center + Math.sin(t) * (range * 0.5);
    this.syncPreviewPosition();
  }

  private drop() {
    if (this.phase !== 'aiming' || !this.previewBody) return;
    this.ensureAudio();
    this.playTone(320, 0.06, 0.08);

    const body = this.previewBody;
    this.previewBody = null;
    hidePreview();
    setDropEnabled(false);

    Matter.Body.setStatic(body, false);
    this.fallingBody = body;
    this.fallTargetY = this.physics.getLandingY(body);
    this.phase = 'falling';
  }

  private updateFalling() {
    const body = this.fallingBody;
    if (!body) return;

    const nextY = body.position.y + FALL_SPEED;
    if (nextY >= this.fallTargetY) {
      Matter.Body.setPosition(body, { x: body.position.x, y: this.fallTargetY });
      this.landPiece(body);
      return;
    }
    Matter.Body.setPosition(body, { x: body.position.x, y: nextY });
  }

  private landPiece(body: StackBody) {
    this.fallingBody = null;
    const result = this.physics.placeStackPiece(body);

    if (!result.ok) {
      showStatus('빗나갔어요!', 1200);
      this.playTone(160, 0.12, 0.1);
      this.endGame();
      return;
    }

    this.score.floors = this.physics.getPlacedCount();
    this.updateScoreHeight();
    this.records = loadRecords();
    updateHud(this.score, this.records);
    this.followCamera();

    if (result.perfect) {
      this.perfectStreak++;
      const msg =
        this.perfectStreak >= 3
          ? `Perfect ×${this.perfectStreak}!`
          : 'Perfect!';
      showStatus(msg, COMBO_SHOW_MS);
      this.playTone(640 + this.perfectStreak * 40, 0.07, 0.1);
    } else {
      this.perfectStreak = 0;
      if (result.overhang > 24) {
        showStatus('다음 층이 좁아졌어요', 500);
      }
      this.playTone(440, 0.06, 0.08);
    }

    this.phase = 'aiming';
    this.spawnPreview(true);
    setDropEnabled(true);
  }

  private updateScoreHeight() {
    const { stackBaseY } = this.physics.layout;
    const topY = this.physics.getStackTopY();
    const heightPx = Math.max(0, stackBaseY - topY);
    this.score.heightCm = Math.round(heightPx * CM_PER_PX);
  }

  private followCamera() {
    const h = this.physics.height;
    const topY = this.physics.getStackTopY();
    const marginTop = h * CAMERA_TOP_RATIO;
    if (topY >= marginTop) return;

    const dy = marginTop - topY;
    this.physics.shiftWorld(dy);
    this.scene3d.shiftWorldDown(dy);
  }

  private endGame() {
    this.phase = 'ended';
    setDropEnabled(false);
    dom.btnStop.hidden = true;
    hidePreview();
    this.fallingBody = null;
    this.playTone(180, 0.15, 0.12);

    const { newAllTime, newDaily } = saveRecords(this.score.heightCm);
    this.records = loadRecords();
    updateHud(this.score, this.records);

    const title = newAllTime || newDaily ? '🎉 새 기록!' : '게임 오버';
    const tag = newDaily ? '오늘의 챌린지 갱신' : newAllTime ? '역대 최고 갱신' : '기록 도전';
    const hint =
      this.score.heightCm >= this.records.allTime
        ? '공유 카드로 친구에게 도전장을 내보세요!'
        : `최고 기록 ${this.records.allTime}cm — 한 층만 더!`;

    showEndOverlay({
      title,
      tag,
      stats: `${this.score.floors}층 · ${this.score.heightCm}cm`,
      hint,
      showShare: true,
    });
  }

  private openShare() {
    renderShareCard(dom.shareCanvas, this.score, this.records, {
      scene: this.sceneCanvas,
      physics: this.canvas,
    });
    const url = dom.shareCanvas.toDataURL('image/png');
    dom.btnDownload.href = url;
    dom.shareModal.hidden = false;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const dpr = Math.min(window.devicePixelRatio, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.restore();

    for (const b of this.physics.stackBodies) {
      if (b === this.fallingBody) continue;
      drawMatterBody(this.ctx, b, 1);
    }

    const active = this.fallingBody ?? this.previewBody;
    if (active) {
      drawMatterBody(this.ctx, active, this.fallingBody ? 1 : 0.88);
      if (this.previewBody) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
        this.ctx.setLineDash([6, 6]);
        this.ctx.beginPath();
        const support = this.physics.getSupportLayer();
        const dropY = active.position.y;
        const guideEnd = Math.min(support.topY - 2, this.physics.getStackTopY() - 2);
        this.ctx.moveTo(active.position.x, dropY + 16);
        this.ctx.lineTo(active.position.x, guideEnd);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    this.physics.step();

    if (this.phase === 'aiming') {
      this.updateAim();
    } else if (this.phase === 'falling') {
      this.updateFalling();
    }

    this.draw();
  };

  private ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
  }

  private playTone(freq: number, dur: number, vol: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + dur);
    osc.start();
    osc.stop(this.audioCtx.currentTime + dur);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.scene3d.dispose();
  }
}
