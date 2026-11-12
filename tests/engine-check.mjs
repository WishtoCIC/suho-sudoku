// 퍼즐 생성기 검사: 모든 종류·난이도에서 답이 하나뿐이고 해답이 규칙에 맞는지 확인
// 실행: node tests/engine-check.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('/* ================= 문제 만들기');
const end = html.indexOf('/* ================= 화면 ================= */');
if (start < 0 || end < 0) throw new Error('엔진 구역 표시를 찾지 못했어요');
const LEVELS_SRC = html.match(/const LEVELS = (\[[\s\S]*?\]);/)[1];

const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  html.slice(start, end).replace(/^const /gm, 'var ') + `\nvar LEVELS = ${LEVELS_SRC};`,
  ctx
);

let fail = 0;
const check = (name, p) => {
  const n = p.S.n, puz = p.puz.flat(), sol = p.sol.flat();
  if (ctx.solveCount(puz, p.S, 2) !== 1) { console.log('✗ 답이 하나가 아님', name); fail++; }
  for (const R of p.S.regs) if (new Set(R.map(i => sol[i])).size !== n) { console.log('✗ 해답 규칙 위반', name); fail++; break; }
  puz.forEach((v, i) => { if (v && v !== sol[i]) { console.log('✗ 단서가 해답과 다름', name); fail++; } });
  return puz.filter(Boolean).length;
};

for (const v of Object.keys(ctx.VARIANTS)) for (const d of Object.keys(ctx.DIFFS)) {
  const clues = [], ms = [];
  for (let k = 0; k < 3; k++) { const t = Date.now(); const p = ctx.makeAdult(v, d); ms.push(Date.now() - t); clues.push(check(`${v}/${d}`, p)); }
  console.log(`${v.padEnd(8)}${d.padEnd(8)} 단서 ${clues.join(',')}  ${Math.max(...ms)}ms`);
}
for (const [i, L] of ctx.LEVELS.entries()) {
  const p = ctx.makePuzzle(L);
  console.log(`어린이 ${i + 1}단계 ${L.n}×${L.n} 빈칸 ${p.puz.flat().filter(x => !x).length}/${L.holes}`);
  check(`kid${i + 1}`, p);
}
console.log(fail ? `\n실패 ${fail}건` : '\n모두 통과 ✅');
process.exit(fail ? 1 : 0);
