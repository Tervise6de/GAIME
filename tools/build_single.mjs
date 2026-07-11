// Build a self-contained, double-clickable HTML file from game/ sources:
// concatenates the ES modules in dependency order, strips import/export
// syntax, and inlines everything into one <script>. No server needed.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ORDER = ['rng.js', 'world.js', 'sim.js', 'render.js', 'auto.js', 'scenario.js', 'onboarding.js', 'seeds.js', 'main.js'];

let js = '';
for (const f of ORDER) {
  let src = readFileSync(`game/js/${f}`, 'utf8');
  src = src.replace(/^import .*$/gm, '');            // drop imports (single scope now)
  src = src.replace(/^export default /gm, '');
  src = src.replace(/^export (const|function|let|var|class)/gm, '$1');
  js += `\n// ===== ${f} =====\n${src}\n`;
}

const html = readFileSync('game/index.html', 'utf8');
const single = html.replace(
  '<script type="module" src="js/main.js"></script>',
  `<script>\n'use strict';\n${js}\n</script>`
);

mkdirSync('game/dist', { recursive: true });
writeFileSync('game/dist/HIVEMIND.html', single);
console.log('built game/dist/HIVEMIND.html', (single.length / 1024).toFixed(1) + 'KB');
