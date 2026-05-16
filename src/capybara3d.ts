import * as THREE from 'three';
import type { ViewLayout, PlatformSegment, StackLandmarks, StackZone } from './layout';
import { fallbackPlatformSegments } from './layout';

const TEXTURE_URL = `${import.meta.env.BASE_URL}capybara-texture.png`;
const TEX_ASPECT_DEFAULT = 252 / 284;

/**
 * 스프라이트 UV (0~1, 아래=0) — 목~등만 (머리·눈 구간 제외)
 */
const STACK_RIDGE: { x: number; y: number }[] = [
  { x: 0.34, y: 0.83 },
  { x: 0.42, y: 0.79 },
  { x: 0.5, y: 0.76 },
  { x: 0.58, y: 0.78 },
  { x: 0.66, y: 0.85 },
];

/** 화면 높이 대비 카피바라 스프라이트 크기 */
const CAPY_SCREEN_HEIGHT = 0.24;
const CAPY_MAX_WIDTH = 0.52;

function createCapyMaterial(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.08,
  });
}

function textureAspect(texture?: THREE.Texture): number {
  const img = texture?.image as { width?: number; height?: number } | undefined;
  if (img?.width && img?.height) return img.width / img.height;
  return TEX_ASPECT_DEFAULT;
}

function buildCapyBillboard(texture?: THREE.Texture): THREE.Mesh {
  const h = 1;
  const w = h * textureAspect(texture);
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = texture
    ? createCapyMaterial(texture)
    : new THREE.MeshBasicMaterial({ color: 0x9a7654 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'body';
  return mesh;
}

export class CapybaraScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private capy: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private shadow: THREE.Mesh;
  private timer = new THREE.Timer();
  private raf = 0;
  private readonly box = new THREE.Box3();
  private readonly size = new THREE.Vector3();
  private readonly center = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private screenW = 0;
  private screenH = 0;
  private lastLayout: ViewLayout | null = null;
  private stackZone: StackZone = { left: 0, right: 0, surfaceY: 0 };
  private scrollScreenY = 0;
  /** 텍스처 로드 후 등으로 3D 스택 존이 바뀌었을 때 물리를 다시 맞춤 */
  onLayoutChanged?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0xffffff, 1);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 80);

    this.capy = new THREE.Group();
    this.bodyMesh = buildCapyBillboard();
    this.capy.add(this.bodyMesh);
    this.scene.add(this.capy);

    const loader = new THREE.TextureLoader();
    loader.load(
      TEXTURE_URL,
      (texture) => {
        const mesh = buildCapyBillboard(texture);
        this.capy.remove(this.bodyMesh);
        this.bodyMesh.geometry.dispose();
        (this.bodyMesh.material as THREE.Material).dispose();
        this.capy.add(mesh);
        this.bodyMesh = mesh;
        if (this.lastLayout) this.setLayout(this.lastLayout);
      },
      undefined,
      () => console.warn('capybara texture failed:', TEXTURE_URL),
    );

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 6),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08 }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.shadow);

    this.timer.connect(document);

    this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.animate();
  }

  getStackZone(): StackZone {
    return this.stackZone;
  }

  resetWorldScroll() {
    this.scrollScreenY = 0;
  }

  /** 탑이 높아지면 카피바라·쌓기 면을 화면 아래로 스크롤 */
  shiftWorldDown(screenDy: number) {
    if (screenDy <= 0 || this.screenH <= 0) return;
    const viewH = 2;
    const delta = viewH * (screenDy / this.screenH);
    this.scrollScreenY += screenDy;
    this.capy.position.y -= delta;
    this.capy.updateMatrixWorld(true);
    this.box.setFromObject(this.capy);
    this.refreshStackZone();
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.screenW = width;
    this.screenH = height;
    this.renderer.setSize(width, height, false);
  }

  private toScreen(v: THREE.Vector3) {
    const p = v.clone().project(this.camera);
    return {
      x: (p.x * 0.5 + 0.5) * this.screenW,
      y: (-p.y * 0.5 + 0.5) * this.screenH,
    };
  }

  /** 스프라이트 bbox + STACK_RIDGE → 머리~등 꼭대기 월드 좌표 */
  private ridgeWorldPoints(): THREE.Vector3[] {
    const min = this.box.min;
    const max = this.box.max;
    const spanX = max.x - min.x;
    const spanY = max.y - min.y;

    return STACK_RIDGE.map((p) =>
      this.tmp.set(min.x + spanX * p.x, min.y + spanY * p.y, 0).clone(),
    );
  }

  private refreshStackZone() {
    if (this.box.isEmpty() || this.screenW <= 0) return;

    const ridgePts = this.ridgeWorldPoints();
    const screen = ridgePts.map((p) => this.toScreen(p));

    const corners = [
      new THREE.Vector3(this.box.min.x, this.box.min.y, 0),
      new THREE.Vector3(this.box.max.x, this.box.min.y, 0),
      new THREE.Vector3(this.box.min.x, this.box.max.y, 0),
      new THREE.Vector3(this.box.max.x, this.box.max.y, 0),
    ];
    const xs = corners.map((c) => this.toScreen(c).x);
    const bodyLeft = Math.min(...xs);
    const bodyRight = Math.max(...xs);
    const pad = (bodyRight - bodyLeft) * 0.08;

    const headTopY = this.toScreen(
      new THREE.Vector3(this.center.x, this.box.max.y, 0),
    ).y;

    const ridgeYs = screen.map((p) => p.y);
    /** 능선 최상단(화면에서 위) = 목 융기 = 파인 윗경계 */
    const dipCrestY = Math.min(...ridgeYs);
    /** 양끝 어깨 능선 = 등 윗경계 */
    const backTopY = (screen[0].y + screen[screen.length - 1].y) * 0.5;
    /** 능선 중앙 최하 = 등 안장 바닥(파인 바닥) */
    const saddleFloorY = Math.max(...ridgeYs);

    const landmarks: StackLandmarks = {
      headTopY: Math.min(headTopY, dipCrestY - 4),
      dipCrestY,
      backTopY: Math.min(backTopY, dipCrestY + 2),
    };

    this.stackZone = {
      left: bodyLeft - pad,
      right: bodyRight + pad,
      surfaceY: saddleFloorY,
      firstLandingY: landmarks.dipCrestY,
      landmarks,
    };
  }

  setLayout(layout: ViewLayout) {
    this.lastLayout = layout;
    const { width, height, backY } = layout;
    this.screenW = width;
    this.screenH = height;
    const aspect = width / height;

    const viewH = 2;
    const viewW = viewH * aspect;
    this.camera.left = -viewW / 2;
    this.camera.right = viewW / 2;
    this.camera.top = viewH / 2;
    this.camera.bottom = -viewH / 2;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0.32, 10);
    this.camera.lookAt(0, 0.32, 0);

    const pxToWorldY = (screenY: number) => viewH * (0.5 - screenY / height);
    const capyScreenH = height * CAPY_SCREEN_HEIGHT;
    const targetWorldH = viewH * (capyScreenH / height);
    const maxWorldW = viewW * CAPY_MAX_WIDTH;

    this.capy.rotation.set(0, 0, 0);
    this.capy.scale.set(1, 1, 1);
    this.capy.position.set(0, 0, 0);
    this.capy.updateMatrixWorld(true);

    this.box.setFromObject(this.capy);
    this.box.getSize(this.size);
    const scale = Math.min(maxWorldW / this.size.x, targetWorldH / this.size.y);
    this.capy.scale.setScalar(scale);

    this.capy.updateMatrixWorld(true);
    this.box.setFromObject(this.capy);
    this.box.getCenter(this.center);

    const ridgePts = this.ridgeWorldPoints();
    let anchorPt = ridgePts[0];
    for (const p of ridgePts) {
      if (p.y < anchorPt.y) anchorPt = p;
    }
    const backWorldY = pxToWorldY(backY);
    const centerX = viewW * (layout.capyCenterX - 0.5);

    this.scrollScreenY = 0;
    this.capy.position.x = centerX - this.center.x;
    this.capy.position.y += backWorldY - anchorPt.y;

    this.capy.updateMatrixWorld(true);
    this.box.setFromObject(this.capy);

    const feetScreen = this.toScreen(new THREE.Vector3(this.center.x, this.box.min.y, 0));
    const maxFeetY = height - layout.controlsBottom - height * 0.025;
    if (feetScreen.y > maxFeetY) {
      this.capy.position.y += (viewH * (feetScreen.y - maxFeetY)) / height;
      this.capy.updateMatrixWorld(true);
      this.box.setFromObject(this.capy);
    }

    this.refreshStackZone();

    const shadowY = this.box.min.y + 0.02;
    this.box.getCenter(this.center);
    this.shadow.position.set(this.center.x, shadowY, -0.05);
    const shadowW = this.box.max.x - this.box.min.x;
    this.shadow.scale.set(shadowW * 0.42, shadowW * 0.12, 1);

    this.onLayoutChanged?.();
  }

  getStackPlatform(_layout: ViewLayout): PlatformSegment[] {
    if (this.screenW <= 0 || this.box.isEmpty()) {
      return fallbackPlatformSegments(this.screenW, _layout);
    }

    const ridgePts = this.ridgeWorldPoints();
    const screen = ridgePts.map((p) => this.toScreen(p));
    const segH = 18;
    const segments: PlatformSegment[] = [];

    for (let i = 0; i < screen.length; i++) {
      const p = screen[i];
      const next = screen[i + 1];
      const prev = screen[i - 1];
      const span = next
        ? Math.hypot(next.x - p.x, next.y - p.y)
        : prev
          ? Math.hypot(p.x - prev.x, p.y - prev.y)
          : 40;
      segments.push({
        x: p.x,
        y: p.y + segH * 0.5,
        w: span * 1.12 + 34,
        h: segH,
        angle: 0,
      });
    }

    return segments;
  }

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate);
    this.timer.update();
    const t = this.timer.getElapsed();
    this.bodyMesh.scale.x = 1 + Math.sin(t * 1.3) * 0.004;
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.timer.dispose();
    this.capy.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.renderer.dispose();
  }
}
