#!/usr/bin/env node
// coverage-map — deriva la cobertura E2E cruzando specs (CA de Jira) vs tests.
//
// El spec es el contrato: enumera los criterios de aceptación (CA-1, CA-2, …).
// Cada test referencia el CA que cubre (en su título o en el comentario de
// arriba) + su tag de madurez (@regression / @smoke / @unreviewed).
// Este script calcula, por módulo: CA totales, CA cubiertos por test graduado,
// CA a medias (solo @unreviewed) y CA sin ningún test.
//
// Uso:
//   node coverage-map.mjs [--specs <dir>] [--tests <dir>] [--repo <nombre>]
//                         [--out <archivo.json>] [--json] [--strict]
// Defaults: --specs e2e/specs  --tests e2e/tests  (convención in-repo)
// --strict: exit 1 si algún CA de un spec no tiene test graduado (para el gate).

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const SPECS_DIR = opt('specs', 'e2e/specs');
const TESTS_DIR = opt('tests', 'e2e/tests');
const REPO = opt('repo', basename(process.cwd()));
const OUT = opt('out', 'e2e/artifacts/coverage.json');
const JSON_ONLY = has('json');
const STRICT = has('strict');

// ---- helpers --------------------------------------------------------------
const walk = (dir, test) => {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p, test));
    else if (test(p)) out.push(p);
  }
  return out;
};
const distinct = (arr) => [...new Set(arr)];
const caNum = (ca) => parseInt(ca.slice(3), 10);
const byCa = (a, b) => caNum(a) - caNum(b);

// ---- 1 · parsear specs (el denominador) -----------------------------------
// Un CA declarado = fila de tabla que arranca con `| CA-N |`.
const parseSpec = (file) => {
  const text = readFileSync(file, 'utf8');
  const cas = distinct([...text.matchAll(/^\|\s*(CA-\d+)\s*\|/gim)].map((m) => m[1]));
  const jira = (text.match(/Jira:\**\s*([A-Z][A-Z0-9]+-\d+)/) || [])[1] || null;
  return { module: basename(file).replace(/\.spec\.md$/i, ''), file, jira, cas };
};

// ---- 2 · parsear tests (el numerador) -------------------------------------
// Recorre líneas; acumula CA-N vistos (comentarios/título) hasta topar un
// `test(...)`; al test le asigna esos CA + su tag de madurez.
const GRADUATED = /@regression|@smoke/;
const parseTests = (file) => {
  const lines = readFileSync(file, 'utf8').split('\n');
  const tests = [];
  let pending = [];
  const TEST_RE = /(?:^|\s)test(?:\.\w+)?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/;
  for (const line of lines) {
    for (const m of line.matchAll(/CA-\d+/g)) pending.push(m[0]);
    const t = line.match(TEST_RE);
    if (t) {
      const title = t[2];
      const cas = distinct(pending.concat([...title.matchAll(/CA-\d+/g)].map((x) => x[0])));
      tests.push({ title, cas, graduated: GRADUATED.test(title) });
      pending = [];
    }
  }
  return tests;
};

// ---- 3 · cruzar -----------------------------------------------------------
const specFiles = walk(SPECS_DIR, (p) => /\.spec\.md$/i.test(p));
const testFiles = walk(TESTS_DIR, (p) => /\.spec\.ts$/i.test(p));

const specs = specFiles.map(parseSpec);
const testsByModule = new Map();
for (const f of testFiles) {
  // módulo del test = el spec cuyo nombre aparece en la ruta, o el stem del archivo.
  const stem = basename(f).replace(/\.spec\.ts$/i, '');
  const match = specs.find((s) => f.includes(s.module)) || { module: stem };
  const list = testsByModule.get(match.module) || [];
  list.push(...parseTests(f));
  testsByModule.set(match.module, list);
}

const statusOf = (total, covered, unreviewed) => {
  if (total === 0) return 'no-spec';
  if (covered === total) return 'covered';
  if (covered > 0 || unreviewed > 0) return 'partial';
  return 'none';
};

const modules = specs.map((s) => {
  const tests = testsByModule.get(s.module) || [];
  const gradCAs = distinct(tests.filter((t) => t.graduated).flatMap((t) => t.cas)).filter((c) => s.cas.includes(c));
  const anyCAs = distinct(tests.flatMap((t) => t.cas)).filter((c) => s.cas.includes(c));
  const unreviewedCAs = anyCAs.filter((c) => !gradCAs.includes(c));
  const missingCAs = s.cas.filter((c) => !anyCAs.includes(c)).sort(byCa);
  return {
    module: s.module,
    jira: s.jira,
    hasSpec: true,
    totalCAs: s.cas.length,
    coveredCAs: gradCAs.length,
    unreviewedCAs: unreviewedCAs.length,
    missingCAs,
    tests: tests.length,
    coveragePct: s.cas.length ? Math.round((gradCAs.length / s.cas.length) * 100) : 0,
    status: statusOf(s.cas.length, gradCAs.length, unreviewedCAs.length),
  };
});

// módulos con tests pero sin spec (no medibles — se listan como aviso)
for (const [mod, tests] of testsByModule) {
  if (!specs.find((s) => s.module === mod)) {
    modules.push({
      module: mod, jira: null, hasSpec: false, totalCAs: 0, coveredCAs: 0,
      unreviewedCAs: 0, missingCAs: [], tests: tests.length, coveragePct: 0, status: 'no-spec',
    });
  }
}

const totalCAs = modules.reduce((a, m) => a + m.totalCAs, 0);
const coveredCAs = modules.reduce((a, m) => a + m.coveredCAs, 0);
const report = {
  generatedAt: new Date().toISOString(),
  repo: REPO,
  totals: {
    modules: modules.length,
    specModules: modules.filter((m) => m.hasSpec).length,
    totalCAs,
    coveredCAs,
    coveragePct: totalCAs ? Math.round((coveredCAs / totalCAs) * 100) : 0,
  },
  modules: modules.sort((a, b) => a.module.localeCompare(b.module)),
};

// ---- 4 · salida -----------------------------------------------------------
if (JSON_ONLY) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  const pad = (s, n) => String(s).padEnd(n);
  const ICON = { covered: '✅', partial: '🟡', none: '⬜', 'no-spec': '❔' };
  console.log(`\n  Cobertura E2E — ${REPO}`);
  console.log(`  ${pad('Módulo', 26)} ${pad('Jira', 11)} ${pad('CA', 8)} ${pad('%', 5)} Estado`);
  console.log(`  ${'─'.repeat(64)}`);
  for (const m of report.modules) {
    const ca = m.hasSpec ? `${m.coveredCAs}/${m.totalCAs}` : '—';
    console.log(
      `  ${pad(m.module, 26)} ${pad(m.jira || '—', 11)} ${pad(ca, 8)} ${pad(m.coveragePct + '%', 5)} ${ICON[m.status]} ${m.status}` +
      (m.missingCAs.length ? `  faltan: ${m.missingCAs.join(', ')}` : '')
    );
  }
  console.log(`  ${'─'.repeat(64)}`);
  console.log(`  TOTAL  ${report.totals.coveredCAs}/${report.totals.totalCAs} CA graduados · ${report.totals.coveragePct}% · ${report.totals.specModules} módulos con spec`);
  console.log(`  JSON → ${OUT}\n`);
}

// ---- 5 · gate -------------------------------------------------------------
if (STRICT) {
  const gaps = report.modules.filter((m) => m.hasSpec && m.status !== 'covered');
  if (gaps.length) {
    console.error(`✘ coverage-map --strict: ${gaps.length} módulo(s) con CA sin test graduado:`);
    for (const m of gaps) {
      const detail = m.missingCAs.length ? `sin test: ${m.missingCAs.join(', ')}` : `a medias (${m.unreviewedCAs} CA sin graduar)`;
      console.error(`  · ${m.module} — ${detail}`);
    }
    process.exit(1);
  }
}
