#!/usr/bin/env node
// coverage-dashboard — genera el tablero HTML de cobertura E2E de todos los
// frontends, cruzando el manifiesto de módulos (apps.json) con los coverage.json
// que produce coverage-map en cada repo.
//
// Uso:
//   node coverage-dashboard.mjs --manifest apps.json --out coverage-map.html \
//        coverage/mono-crm.json coverage/soga.json coverage/backoffice.json
//
// Los coverage.json se indexan por su campo .repo y se casan con app.coverageRepo.
// Un módulo sin entrada en coverage aparece como "sin cobertura".

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const MANIFEST = opt('manifest', 'apps.json');
const OUT = opt('out', 'coverage-map.html');
const covFiles = args.filter((a) => a.endsWith('.json') && a !== MANIFEST);

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const coverageByRepo = new Map();
for (const f of covFiles) {
  const c = JSON.parse(readFileSync(f, 'utf8'));
  coverageByRepo.set(c.repo, c);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const STATUS = {
  covered:  { tag: 'Cubierto',       cls: 'covered' },
  partial:  { tag: 'A medias',       cls: 'partial' },
  none:     { tag: 'Sin cobertura',  cls: 'none' },
  'no-spec':{ tag: 'Sin spec',       cls: 'none' },
};

// ---- merge manifiesto × coverage ------------------------------------------
const apps = manifest.apps.map((app) => {
  const cov = coverageByRepo.get(app.coverageRepo);
  const covByModule = new Map((cov?.modules || []).map((m) => [m.module, m]));
  const modules = app.modules.map((mod) => {
    const c = covByModule.get(mod.key);
    if (!c || (!c.hasSpec && c.tests === 0)) {
      return { name: mod.name, status: 'none', label: '— CA', missing: [] };
    }
    return {
      name: mod.name,
      status: c.status,
      label: c.hasSpec ? `${c.coveredCAs}/${c.totalCAs} CA` : `${c.tests} tests`,
      missing: c.missingCAs || [],
      jira: c.jira,
    };
  });
  const covered = modules.filter((m) => m.status === 'covered').length;
  const partial = modules.filter((m) => m.status === 'partial').length;
  const totalCAs = app.modules.reduce((a, mod) => a + ((covByModule.get(mod.key)?.totalCAs) || 0), 0);
  const coveredCAs = app.modules.reduce((a, mod) => a + ((covByModule.get(mod.key)?.coveredCAs) || 0), 0);
  return {
    ...app, modules, covered, partial,
    total: modules.length, totalCAs, coveredCAs,
    // Titular honesto: % de MÓDULOS del universo con todos sus CA graduados.
    // (El % por CA solo aplica a los specs que existen y se muestra por módulo.)
    modPct: modules.length ? Math.round((covered / modules.length) * 100) : 0,
    hasCoverage: !!cov,
  };
});

const now = new Date().toISOString().slice(0, 10);

// ---- render ----------------------------------------------------------------
const appCard = (a) => `
    <div class="app-card">
      <div><h2>${esc(a.name)} <span class="alias">/ ${esc(a.alias)}</span></h2><p class="repo">${esc(a.repo)}</p></div>
      <span class="pipe ${a.pipeline ? 'on' : 'off'}"><span class="dot"></span>${a.pipeline ? 'Pipeline E2E activo' : 'Sin pipeline E2E aún'}</span>
      <div>
        <div class="pct">${a.modPct}%<small> &nbsp;módulos cubiertos</small></div>
        <div class="bar">
          <span class="seg-covered" style="width:${a.total ? (a.covered / a.total) * 100 : 0}%"></span>
          <span class="seg-partial" style="width:${a.total ? (a.partial / a.total) * 100 : 0}%"></span>
        </div>
      </div>
      <div class="counts"><span>${a.total} módulos</span><span><b>${a.covered}</b> cubiertos · <b>${a.partial}</b> a medias</span></div>
    </div>`;

const modRow = (m) => `
      <div class="mod ${STATUS[m.status].cls}"><span class="name">${esc(m.name)}</span><span class="cas">${esc(m.label)}</span><span class="tag ${STATUS[m.status].cls}">${STATUS[m.status].tag}</span></div>`;

const appBlock = (a) => `
  <section class="appblock">
    <h3>${esc(a.name)} <span class="alias">${esc(a.repo)} · ${a.pipeline ? 'pipeline activo' : 'falta el pipeline'}</span></h3>
    <p class="note">${a.coveredCAs} de ${a.totalCAs} criterios de aceptación con test graduado · ${a.modules.filter((m) => m.status !== 'none').length} de ${a.total} módulos iniciados${a.hasCoverage ? '' : ' · (sin coverage.json aún — se muestra el universo de módulos)'}</p>
    <div class="mods">${a.modules.map(modRow).join('')}
    </div>
  </section>`;

const html = `<title>Mapa de cobertura E2E — Frontends Bord</title>
<style>
  :root{--bg:#f4f6f5;--panel:#fff;--panel-2:#fafbfb;--ink:#1b2420;--ink-soft:#55605a;--ink-faint:#8b948e;--line:#e2e7e4;--accent:#24506b;--accent-soft:#e7eef2;--s-covered:#16936a;--s-covered-bg:#dff3ea;--s-partial:#c78a1e;--s-partial-bg:#fbefd6;--s-none:#9aa39d;--s-none-bg:#eef1ef;--radius:12px;--mono:ui-monospace,"SF Mono",Menlo,monospace;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  @media (prefers-color-scheme:dark){:root{--bg:#10140f;--panel:#191e18;--panel-2:#1e241d;--ink:#e8ede9;--ink-soft:#a6b0a9;--ink-faint:#6f7a72;--line:#2a312a;--accent:#6fb3d8;--accent-soft:#1d2b33;--s-covered:#3fc491;--s-covered-bg:#12291f;--s-partial:#e6b652;--s-partial-bg:#2e2612;--s-none:#6d766f;--s-none-bg:#232a23}}
  :root[data-theme="light"]{--bg:#f4f6f5;--panel:#fff;--panel-2:#fafbfb;--ink:#1b2420;--ink-soft:#55605a;--ink-faint:#8b948e;--line:#e2e7e4;--accent:#24506b;--accent-soft:#e7eef2;--s-covered:#16936a;--s-covered-bg:#dff3ea;--s-partial:#c78a1e;--s-partial-bg:#fbefd6;--s-none:#9aa39d;--s-none-bg:#eef1ef}
  :root[data-theme="dark"]{--bg:#10140f;--panel:#191e18;--panel-2:#1e241d;--ink:#e8ede9;--ink-soft:#a6b0a9;--ink-faint:#6f7a72;--line:#2a312a;--accent:#6fb3d8;--accent-soft:#1d2b33;--s-covered:#3fc491;--s-covered-bg:#12291f;--s-partial:#e6b652;--s-partial-bg:#2e2612;--s-none:#6d766f;--s-none-bg:#232a23}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.5;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1080px;margin:0 auto;padding:40px 24px 64px}
  .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700;margin:0 0 8px}
  h1{font-size:30px;line-height:1.15;margin:0 0 10px;letter-spacing:-.02em;text-wrap:balance}
  .sub{color:var(--ink-soft);max-width:62ch;margin:0;font-size:15px}
  .meta{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--ink-faint)}
  .apps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:28px 0 8px}
  @media (max-width:720px){.apps{grid-template-columns:1fr}}
  .app-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:18px;display:flex;flex-direction:column;gap:12px}
  .app-card h2{margin:0;font-size:18px;letter-spacing:-.01em;display:flex;align-items:baseline;gap:8px}
  .app-card h2 .alias{font-family:var(--mono);font-size:12px;color:var(--ink-faint);font-weight:500}
  .repo{font-family:var(--mono);font-size:11.5px;color:var(--ink-faint);margin:-6px 0 0}
  .pipe{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;width:fit-content}
  .pipe.on{color:var(--s-covered);background:var(--s-covered-bg)}.pipe.off{color:var(--s-none);background:var(--s-none-bg)}
  .pipe .dot{width:7px;height:7px;border-radius:50%;background:currentColor}
  .bar{display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--s-none-bg)}
  .bar span{display:block;height:100%}.seg-covered{background:var(--s-covered)}.seg-partial{background:var(--s-partial)}
  .counts{display:flex;justify-content:space-between;font-size:12.5px;color:var(--ink-soft)}
  .counts b{color:var(--ink);font-variant-numeric:tabular-nums}
  .pct{font-family:var(--mono);font-size:26px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .pct small{font-size:13px;color:var(--ink-faint);font-weight:500}
  .legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin:26px 0 6px;padding:14px 16px;background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);font-size:13px}
  .legend .item{display:inline-flex;align-items:center;gap:8px;color:var(--ink-soft)}
  .swatch{width:12px;height:12px;border-radius:4px;flex:none}.sw-covered{background:var(--s-covered)}.sw-partial{background:var(--s-partial)}.sw-none{background:var(--s-none)}
  section.appblock{margin-top:34px}
  .appblock>h3{font-size:15px;margin:0 0 4px;display:flex;align-items:baseline;gap:10px}
  .appblock>h3 .alias{font-family:var(--mono);font-size:12px;color:var(--ink-faint);font-weight:500}
  .appblock>.note{margin:0 0 14px;font-size:13px;color:var(--ink-soft)}
  .mods{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  @media (max-width:640px){.mods{grid-template-columns:1fr}}
  .mod{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--panel);border:1px solid var(--line);border-radius:10px;border-left:4px solid var(--s-none)}
  .mod.covered{border-left-color:var(--s-covered)}.mod.partial{border-left-color:var(--s-partial)}
  .mod .name{font-size:14px;font-weight:550;flex:1}
  .mod .cas{font-family:var(--mono);font-size:12px;color:var(--ink-faint);font-variant-numeric:tabular-nums}
  .tag{font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;padding:3px 8px;border-radius:6px;white-space:nowrap}
  .tag.covered{color:var(--s-covered);background:var(--s-covered-bg)}.tag.partial{color:var(--s-partial);background:var(--s-partial-bg)}.tag.none{color:var(--s-none);background:var(--s-none-bg)}
  .model{margin-top:44px;padding:24px;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
  .model h3{margin:0 0 4px;font-size:16px}.model p.lead{margin:0 0 20px;color:var(--ink-soft);font-size:14px;max-width:64ch}
  .layers{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}@media (max-width:720px){.layers{grid-template-columns:1fr}}
  .layer{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:16px}
  .layer .n{font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:700}
  .layer h4{margin:6px 0 6px;font-size:14px}.layer p{margin:0;font-size:13px;color:var(--ink-soft)}
  .layer code{font-family:var(--mono);font-size:12px;background:var(--accent-soft);color:var(--accent);padding:1px 5px;border-radius:4px}
  footer.foot{margin-top:28px;font-size:12.5px;color:var(--ink-faint);text-align:center}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Regresión E2E · Playwright</p>
    <h1>Mapa de cobertura de los frontends de Bord</h1>
    <p class="sub">Qué módulo de cada producto tiene pruebas automáticas de regresión, cuál está a medias y cuál no tiene nada. La cobertura se mide por criterio de aceptación (CA), tomando el spec como contrato.</p>
    <p class="meta">Generado automáticamente por coverage-dashboard · ${now} · fuente: specs + tests de cada repo</p>
  </header>
  <div class="apps">${apps.map(appCard).join('')}
  </div>
  <div class="legend">
    <span class="item"><span class="swatch sw-covered"></span>Cubierto — todos los CA con test graduado</span>
    <span class="item"><span class="swatch sw-partial"></span>A medias — hay tests pero sin graduar / faltan CA</span>
    <span class="item"><span class="swatch sw-none"></span>Sin cobertura</span>
  </div>
  ${apps.map(appBlock).join('')}
  <div class="model">
    <h3>Cómo se sabe que se cubren todos los casos de uso</h3>
    <p class="lead">La cobertura no se declara: se deriva. El spec pone el denominador (los CA de Jira), los tests el numerador, y coverage-map los cruza en el pipeline.</p>
    <div class="layers">
      <div class="layer"><span class="n">01 · denominador</span><h4>El spec es el contrato</h4><p>Cada módulo tiene un <code>.spec.md</code> con todos los CA de Jira. La define el negocio.</p></div>
      <div class="layer"><span class="n">02 · numerador</span><h4>Trazabilidad por CA</h4><p>Cada test referencia el <code>CA-N</code> que cubre + su tag de madurez.</p></div>
      <div class="layer"><span class="n">03 · derivado</span><h4>El mapa se calcula</h4><p><code>coverage-map</code> saca <code>CA con test / CA totales</code> por módulo y corre en CI.</p></div>
    </div>
  </div>
  <footer class="foot">Mantenido por los devs como parte del desarrollo · este HTML lo regenera coverage-dashboard desde los coverage.json de cada repo</footer>
</div>`;

writeFileSync(OUT, html);
console.log(`✓ Tablero generado → ${OUT}`);
console.log(`  Apps: ${apps.map((a) => `${a.name} ${a.modPct}% módulos (${a.coveredCAs}/${a.totalCAs} CA)`).join(' · ')}`);
