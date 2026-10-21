import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
function dataUrl(asset) {
  const ext = path.extname(asset);
  const mime = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml' }[ext];
  if (!mime) throw new Error(`Unsupported asset: ${asset}`);
  return `data:${mime};base64,${fs.readFileSync(path.join(dist, asset)).toString('base64')}`;
}
html = html.replace(/<link rel="icon"[^>]+href="([^"]+)"[^>]*>/, (_, asset) => `<link rel="icon" href="${dataUrl(asset)}">`);
html = html.replace(/<script type="module"[^>]+src="([^"]+)"[^>]*><\/script>/, (_, asset) => {
  const js = fs.readFileSync(path.join(dist, asset), 'utf8');
  return `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`;
});
html = html.replace(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/, (_, asset) => {
  const css = fs.readFileSync(path.join(dist, asset), 'utf8').replace(/url\(\/?(assets\/[^)]+)\)/g, (_, url) => `url(${dataUrl(url)})`);
  return `<style>${css}</style>`;
});
const output = path.join(dist, 'JapaneseMaster.html');
fs.writeFileSync(output, html);
console.log(`Standalone app: ${output} (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
