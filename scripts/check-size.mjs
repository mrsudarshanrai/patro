// Fails when the gzipped ESM bundle or stylesheet grows past its budget. Run after `npm run build`.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');
const gzipped = (files) =>
  files.reduce((total, file) => total + gzipSync(readFileSync(join(dist, file))).length, 0);

const esm = readdirSync(dist).filter((file) => file.endsWith('.js'));
const budgets = [
  { name: 'JS (ESM, all chunks)', bytes: gzipped(esm), limit: 23_500 },
  { name: 'CSS', bytes: gzipped(['css/style.css']), limit: 3_300 },
];

let over = false;
for (const { name, bytes, limit } of budgets) {
  const ok = bytes <= limit;
  over ||= !ok;
  console.log(
    `${ok ? 'ok  ' : 'OVER'} ${name}: ${(bytes / 1000).toFixed(1)} kB gzip (limit ${limit / 1000} kB)`,
  );
}
if (over) process.exit(1);
