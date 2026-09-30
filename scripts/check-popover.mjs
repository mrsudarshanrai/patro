// Opens the Datepicker in headless Chrome and checks the popover stays attached to its field:
// near viewport edges, after the layout shifts, and inside scroll containers. jsdom has no
// layout, so this is the only test of positioning. Needs `npm run build` and Node 22+.
// Chrome: $CHROME, else google-chrome / chromium on PATH.
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const dir = mkdtempSync(join(tmpdir(), 'patro-popover-'));

const findChrome = () => {
  if (process.env.CHROME) return process.env.CHROME;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [name]).toString().trim();
    } catch {
      // try the next name
    }
  }
  throw new Error('No Chrome found: set CHROME to a Chrome or Chromium binary.');
};

// Each scenario renders one open Datepicker; `?s=<name>` picks it.
const fixture = `
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Datepicker } from ${JSON.stringify(join(root, 'dist/index.js'))};

const s = new URLSearchParams(location.search).get('s');
const picker = (props) =>
  h(Datepicker, { label: 'Date', defaultOpen: true, today: new Date(2026, 9, 29), ...props });

const App = () => {
  const [banner, setBanner] = useState(false);
  useEffect(() => { window.shiftLayout = () => setBanner(true); }, []);
  switch (s) {
    case 'right':
      return h('div', { style: { display: 'flex', justifyContent: 'flex-end', padding: 8 } },
        picker({ mode: 'range', numberOfMonths: 2 }));
    case 'bottom':
      return h('div', { style: { position: 'absolute', bottom: 8, left: 8 } }, picker());
    case 'layout-shift':
      return h('div', { style: { padding: 8 } },
        banner && h('div', { style: { height: 120 } }, 'banner'), picker());
    case 'scroll-container':
      return h('div', { id: 'scroller', style: { height: 300, overflow: 'auto', margin: 8 } },
        h('div', { style: { height: 40 } }), picker(), h('div', { style: { height: 900 } }));
    case 'portal-scroll':
      return h('div', { style: { padding: 8, height: 2000 } },
        h('div', { style: { height: 40 } }), picker({ portal: true }));
    case 'placement':
      // Two months, so the popover is wider than the field and each alignment differs.
      return h('div', { style: { padding: '420px 0 0 350px' } },
        picker({ mode: 'range', numberOfMonths: 2, placement: new URLSearchParams(location.search).get('p') }));
    case 'portal-right':
      return h('div', { style: { display: 'flex', justifyContent: 'flex-end', padding: 8 } },
        picker({ mode: 'range', numberOfMonths: 2, portal: true }));
    case 'keyboard':
      return h('div', { style: { padding: 8 } }, picker({ defaultOpen: false }));
    case 'top-end':
      return h('div', { style: { padding: '420px 8px 8px 300px' } }, picker({ placement: 'top-end' }));
  }
};
createRoot(document.getElementById('root')).render(h(App));
`;

const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  const files = {
    '/': ['index.html', 'text/html'],
    '/app.js': ['app.js', 'text/javascript'],
    '/style.css': ['style.css', 'text/css'],
  };
  const [file, type] = files[path] ?? [];
  if (!file) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': type }).end(readFileSync(join(dir, file)));
});

let chrome;
try {
  writeFileSync(join(dir, 'fixture.mjs'), fixture);
  await build({
    entryPoints: [join(dir, 'fixture.mjs')],
    bundle: true,
    outfile: join(dir, 'app.js'),
    nodePaths: [join(root, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });
  writeFileSync(join(dir, 'style.css'), readFileSync(join(root, 'dist/css/style.css')));
  writeFileSync(
    join(dir, 'index.html'),
    '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/style.css">' +
      '<style>body{margin:0}</style><div id="root"></div><script src="/app.js"></script>',
  );
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const profile = join(dir, 'profile');
  chrome = spawn(findChrome(), [
    '--headless=new',
    '--no-sandbox',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const cdp = await connect(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 700,
    height: 700,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const failures = [];
  const check = async (scenario, step, expect) => {
    const geometry = await cdp.evaluate(`(() => {
      const field = document.querySelector('._patro_datepicker_input').getBoundingClientRect();
      const pop = document.querySelector('._patro_datepicker_popper').getBoundingClientRect();
      const { opacity } = getComputedStyle(document.querySelector('._patro_datepicker_popper'));
      return { field: field.toJSON(), pop: pop.toJSON(), vw: innerWidth, vh: innerHeight, opacity };
    })()`);
    const { field, pop, vw, vh, opacity } = geometry;
    const below = Math.round(pop.top - field.bottom);
    const above = Math.round(field.top - pop.bottom);
    const problems = [];
    if (below !== 6 && above !== 6)
      problems.push(`not 6px from the field (below ${below}, above ${above})`);
    if (pop.left < 0 || pop.right > vw || pop.top < 0 || pop.bottom > vh)
      problems.push('off screen');
    if (opacity !== '1') problems.push(`still transparent (opacity ${opacity})`);
    if (expect) problems.push(...expect(field, pop));
    const label = step ? `${scenario} (${step})` : scenario;
    if (problems.length) failures.push(`${label}: ${problems.join(', ')}`);
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${label}`);
  };

  const open = async (scenario) => {
    await cdp.send('Page.navigate', { url: `${origin}/?s=${scenario}` });
    await cdp.waitFor('!!document.querySelector("._patro_datepicker_popper")');
    await sleep(150);
  };

  for (const scenario of ['right', 'bottom', 'top-end', 'portal-right']) {
    await open(scenario);
    await check(scenario);
  }

  // With room on every side, each placement lands on its own side and alignment.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1000,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const offsets = {
    start: (field, pop) => Math.round(pop.left - field.left),
    end: (field, pop) => Math.round(pop.right - field.right),
    center: (field, pop) => Math.round((pop.left + pop.right - field.left - field.right) / 2),
  };
  for (const placement of ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top']) {
    await cdp.send('Page.navigate', { url: `${origin}/?s=placement&p=${placement}` });
    await cdp.waitFor('!!document.querySelector("._patro_datepicker_popper")');
    await sleep(150);
    const [side, align = 'center'] = placement.split('-');
    await check('placement', placement, (field, pop) => {
      const problems = [];
      if ((side === 'top') !== pop.bottom <= field.top) problems.push(`not on the ${side}`);
      if (offsets[align](field, pop) !== 0) problems.push(`not aligned ${align}`);
      return problems;
    });
  }

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 700,
    height: 700,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await open('right');
  await cdp.evaluate('document.querySelector("._patro_header_titleBtn").click()');
  await sleep(300);
  await check('right', 'after switching to the month picker');

  // Opening from the keyboard focuses the grid, even though the popover starts transparent.
  await cdp.send('Page.navigate', { url: `${origin}/?s=keyboard` });
  await cdp.waitFor('!!document.querySelector("._patro_datepicker_input")');
  await cdp.evaluate('document.querySelector("._patro_datepicker_input").focus()');
  for (const type of ['keyDown', 'keyUp']) {
    await cdp.send('Input.dispatchKeyEvent', {
      type,
      key: 'ArrowDown',
      code: 'ArrowDown',
      windowsVirtualKeyCode: 40,
    });
  }
  await sleep(300);
  await check('keyboard', 'opened with ArrowDown');
  const focused = await cdp.evaluate('document.activeElement.getAttribute("role")');
  if (focused !== 'grid') failures.push(`keyboard: focus is on ${focused}, not the day grid`);

  await check('layout-shift', 'before');
  await cdp.evaluate('window.shiftLayout()');
  await sleep(300);
  await check('layout-shift', 'after content appears above');

  await open('scroll-container');
  await cdp.evaluate('document.getElementById("scroller").scrollTop = 30');
  await sleep(300);
  await check('scroll-container', 'after scrolling the container');

  await open('portal-scroll');
  await cdp.evaluate('window.scrollTo(0, 30)');
  await sleep(300);
  await check('portal-scroll', 'after scrolling the page');

  cdp.close();
  if (failures.length) {
    console.error(`\n${failures.length} popover check(s) failed:\n${failures.join('\n')}`);
    process.exitCode = 1;
  }
} finally {
  chrome?.kill();
  server.close();
  rmSync(dir, { recursive: true, force: true });
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((done, fail) => {
    socket.onopen = done;
    socket.onerror = fail;
  });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  };
  const send = (method, params = {}) =>
    new Promise((done) => {
      pending.set(++id, done);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const { result } = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async (expression) => {
    for (let i = 0; i < 50; i++) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${expression}`);
  };
  return { send, evaluate, waitFor, close: () => socket.close() };
}
