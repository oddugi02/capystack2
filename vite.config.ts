import { defineConfig } from 'vite';

/**
 * 로컬: base '/'
 * GitHub Pages 프로젝트 저장소(https://유저.github.io/저장줄 이름/):
 *   Actions에서 BASE_PATH=/저장줄 이름/ 형태로 전달 (양끝 슬래시 권장)
 */
let base = process.env.BASE_PATH || '/';
if (!base.endsWith('/')) base += '/';

export default defineConfig({
  base,
});
