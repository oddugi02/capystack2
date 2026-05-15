import { todayKey } from './daily';
import type { GameScore, Records } from './types';

const BEST_ALL = 'capy_best_all';
const BEST_DAILY_PREFIX = 'capy_best_daily_';

export const dom = {
  intro: document.getElementById('intro')!,
  introDaily: document.getElementById('intro-daily')!,
  btnStart: document.getElementById('btn-start') as HTMLButtonElement,
  scoreFloors: document.getElementById('score-floors')!,
  scoreHeight: document.getElementById('score-height')!,
  bestAll: document.getElementById('best-all')!,
  bestDaily: document.getElementById('best-daily')!,
  preview: document.getElementById('preview')!,
  previewLabel: document.getElementById('preview-label')!,
  status: document.getElementById('status')!,
  btnStop: document.getElementById('btn-stop') as HTMLButtonElement,
  btnDrop: document.getElementById('btn-drop') as HTMLButtonElement,
  btnShare: document.getElementById('btn-share') as HTMLButtonElement,
  overlay: document.getElementById('overlay')!,
  overlayTag: document.getElementById('overlay-tag')!,
  overlayTitle: document.getElementById('overlay-title')!,
  overlayStats: document.getElementById('overlay-stats')!,
  overlayHint: document.getElementById('overlay-hint')!,
  btnRetry: document.getElementById('btn-retry') as HTMLButtonElement,
  btnShareModal: document.getElementById('btn-share-modal') as HTMLButtonElement,
  shareModal: document.getElementById('share-modal')!,
  shareCanvas: document.getElementById('share-canvas') as HTMLCanvasElement,
  btnDownload: document.getElementById('btn-download') as HTMLAnchorElement,
  btnCloseShare: document.getElementById('btn-close-share') as HTMLButtonElement,
};

export function loadRecords(): Records {
  const allTime = Number(localStorage.getItem(BEST_ALL) || 0);
  const daily = Number(localStorage.getItem(BEST_DAILY_PREFIX + todayKey()) || 0);
  return { allTime, daily };
}

export function saveRecords(heightCm: number): { newAllTime: boolean; newDaily: boolean } {
  const records = loadRecords();
  let newAllTime = false;
  let newDaily = false;

  if (heightCm > records.allTime) {
    localStorage.setItem(BEST_ALL, String(heightCm));
    newAllTime = true;
  }
  if (heightCm > records.daily) {
    localStorage.setItem(BEST_DAILY_PREFIX + todayKey(), String(heightCm));
    newDaily = true;
  }
  return { newAllTime, newDaily };
}

export function updateHud(score: GameScore, records: Records) {
  dom.scoreFloors.textContent = String(score.floors);
  dom.scoreHeight.textContent = String(score.heightCm);
  dom.bestAll.textContent = String(records.allTime);
  dom.bestDaily.textContent = String(records.daily);
}

export function showStatus(msg: string, ms = 900) {
  dom.status.textContent = msg;
  dom.status.hidden = false;
  window.setTimeout(() => {
    dom.status.hidden = true;
  }, ms);
}

export function setPreview(x: number, y: number, label: string, color: string) {
  dom.preview.hidden = false;
  dom.preview.style.left = `${x}px`;
  dom.preview.style.top = `${y}px`;
  dom.previewLabel.textContent = label;
  dom.preview.style.setProperty('--preview-color', color);
}

export function hidePreview() {
  dom.preview.hidden = true;
}

export function setDropEnabled(on: boolean) {
  dom.btnDrop.disabled = !on;
}

export function showEndOverlay(opts: {
  title: string;
  tag: string;
  stats: string;
  hint: string;
  showShare: boolean;
}) {
  dom.overlayTag.textContent = opts.tag;
  dom.overlayTitle.textContent = opts.title;
  dom.overlayStats.textContent = opts.stats;
  dom.overlayHint.textContent = opts.hint;
  dom.overlay.hidden = false;
  dom.btnShare.hidden = !opts.showShare;
}

export function hideEndOverlay() {
  dom.overlay.hidden = true;
}
