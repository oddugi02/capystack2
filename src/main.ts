import './style.css';
import { Game } from './game';
import { dom, loadRecords, updateHud } from './ui';
import { dailyChallengeLabel } from './daily';

const sceneCanvas = document.getElementById('scene-3d') as HTMLCanvasElement;
const physicsCanvas = document.getElementById('physics-canvas') as HTMLCanvasElement;

const records = loadRecords();
updateHud({ floors: 0, heightCm: 0 }, records);
dom.introDaily.textContent = dailyChallengeLabel();

new Game(sceneCanvas, physicsCanvas);

const onResize = () => requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);
