// Installs the packed tarball into a fresh project and uses it the way consumers do.
// Needs a prior `npm run build`. SMOKE_REACT picks the React major (default 18).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const react = process.env.SMOKE_REACT ?? '18';
const dir = mkdtempSync(join(tmpdir(), 'patro-smoke-'));
const run = (cmd, args, cwd = dir) =>
  execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString();

try {
  const tarball = run('npm', ['pack', '--pack-destination', dir, '--silent'], root).trim();
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'smoke', private: true }));
  run('npm', [
    'install',
    '--no-audit',
    '--no-fund',
    '--ignore-scripts',
    join(dir, tarball),
    `react@${react}`,
    `react-dom@${react}`,
    `@types/react@${react}`,
  ]);

  writeFileSync(
    join(dir, 'esm.mjs'),
    `
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Calendar, Datepicker, ad2Bs } from 'patro';
import { bs2Ad, isValidBsDate } from 'patro/utils';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const check = (ok, what) => { if (!ok) throw new Error('ESM: ' + what); };
check(ad2Bs('2022-10-24') === '2079-07-07', 'ad2Bs');
check(bs2Ad('2079-07-07') === '2022-10-24' && isValidBsDate('2080-01-31'), 'patro/utils');
check(renderToString(createElement(Calendar, { today: new Date(2026, 9, 29) })).includes('October 2026'), 'Calendar SSR');
check(renderToString(createElement(Datepicker, { defaultOpen: true, portal: true })).includes('_patro_datepicker'), 'Datepicker SSR');
check(readFileSync(require.resolve('patro/style.css'), 'utf8').includes('._patro'), 'patro/style.css');
check(readFileSync(require.resolve('patro/dist/css/style.css'), 'utf8').includes('._patro'), 'patro/dist/css/style.css');
check(readFileSync(require.resolve('patro').replace(/\\.cjs$/, '.js'), 'utf8').startsWith("'use client'"), "'use client' on patro");
check(!readFileSync(require.resolve('patro/utils').replace(/\\.cjs$/, '.js'), 'utf8').includes('use client'), "no 'use client' on patro/utils");
`,
  );
  writeFileSync(
    join(dir, 'cjs.cjs'),
    `
const { Calendar, ad2Bs } = require('patro');
const { bs2Ad } = require('patro/utils');
if (typeof Calendar !== 'function' || ad2Bs('2022-10-24') !== '2079-07-07' || bs2Ad('2079-07-07') !== '2022-10-24') {
  throw new Error('CJS require failed');
}
`,
  );
  writeFileSync(
    join(dir, 'types.mts'),
    `
import { Calendar, Datepicker, type PatroDate, type DatepickerProps } from 'patro';
import { ad2Bs } from 'patro/utils';
const onChange = (value: PatroDate | null) => value?.bs;
const props: DatepickerProps = { mode: 'range', onChange: ({ start }) => start?.ad };
const bs: string = ad2Bs(new Date());
export { Calendar, Datepicker, onChange, props, bs };
`,
  );
  run('node', ['esm.mjs']);
  run('node', ['cjs.cjs']);
  const tsc = join(root, 'node_modules/typescript/bin/tsc');
  for (const resolution of ['nodenext', 'bundler']) {
    const module = resolution === 'nodenext' ? 'nodenext' : 'esnext';
    run('node', [
      tsc,
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      'false',
      '--module',
      module,
      '--moduleResolution',
      resolution,
      '--jsx',
      'react-jsx',
      'types.mts',
    ]);
  }
  console.log(`smoke test passed with React ${react}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
