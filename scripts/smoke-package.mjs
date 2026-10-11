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
import { Calendar, Datepicker, ad2Bs } from 'patrojs';
import { bs2Ad, isValidBsDate } from 'patrojs/utils';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const check = (ok, what) => { if (!ok) throw new Error('ESM: ' + what); };
check(ad2Bs('2022-10-24') === '2079-07-07', 'ad2Bs');
check(bs2Ad('2079-07-07') === '2022-10-24' && isValidBsDate('2080-01-31'), 'patrojs/utils');
check(renderToString(createElement(Calendar, { today: new Date(2026, 9, 29) })).includes('October 2026'), 'Calendar SSR');
check(renderToString(createElement(Datepicker, { defaultOpen: true, portal: true })).includes('_patro_datepicker'), 'Datepicker SSR');
check(readFileSync(require.resolve('patrojs/style.css'), 'utf8').includes('._patro'), 'patro/style.css');
check(readFileSync(require.resolve('patrojs/dist/css/style.css'), 'utf8').includes('._patro'), 'patro/dist/css/style.css');
check(readFileSync(require.resolve('patrojs').replace(/\\.cjs$/, '.js'), 'utf8').startsWith("'use client'"), "'use client' on patrojs");
check(!readFileSync(require.resolve('patrojs/utils').replace(/\\.cjs$/, '.js'), 'utf8').includes('use client'), "no 'use client' on patrojs/utils");
`,
  );
  writeFileSync(
    join(dir, 'cjs.cjs'),
    `
const { Calendar, ad2Bs } = require('patrojs');
const { bs2Ad } = require('patrojs/utils');
if (typeof Calendar !== 'function' || ad2Bs('2022-10-24') !== '2079-07-07' || bs2Ad('2079-07-07') !== '2022-10-24') {
  throw new Error('CJS require failed');
}
`,
  );
  writeFileSync(
    join(dir, 'types.mts'),
    `
import {
  Calendar,
  Datepicker,
  type PatroDate,
  type DatepickerProps,
  type DatepickerSingleProps,
  type DatepickerRangeProps,
  type DateInput,
  type DateRangeInput,
} from 'patrojs';
import { ad2Bs } from 'patrojs/utils';
const onChange = (value: PatroDate | null) => value?.bs;
const props: DatepickerProps = { mode: 'range', onChange: ({ start }) => start?.ad };
const single: DatepickerSingleProps = { editable: true, placement: 'top', valueFormat: 'bs' };
const fromStrings: DatepickerSingleProps = { value: '2026-10-15', minDate: '2026-01-01', today: new Date() };
const day: DateInput = '2026-10-15';
const stay: DateRangeInput = { start: '2026-10-15', end: new Date() };
const range: DatepickerRangeProps = { mode: 'range', minDays: 2, formatValue: ({ start }) => start?.bs ?? '' };
// @ts-expect-error: placement only takes the documented values.
const wrong: DatepickerSingleProps = { placement: 'left' };
const bs: string = ad2Bs(new Date());
export { Calendar, Datepicker, onChange, props, single, range, wrong, bs, fromStrings, day, stay };
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
