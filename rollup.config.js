import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { dts } from 'rollup-plugin-dts';

const entries = { index: './package/index.ts', utils: './package/entries/utils.ts' };

// Components use hooks, so React Server Components must treat them as client code.
// Only the main entry: `patro/utils` stays callable from server code.
// Added after terser, which drops unknown directives.
const clientDirective = () => ({
  name: 'client-directive',
  renderChunk: (code, chunk) =>
    chunk.isEntry && chunk.name === 'index' ? { code: `'use client';\n${code}`, map: null } : null,
});

// One self-contained declaration file per entry, as .d.ts (ESM) and .d.cts (CJS).
const types = Object.entries(entries).map(([name, input]) => ({
  input,
  output: [
    { file: `dist/${name}.d.ts`, format: 'es' },
    { file: `dist/${name}.d.cts`, format: 'es' },
  ],
  plugins: [dts({ tsconfig: './tsconfig.build.json' })],
}));

export default [
  {
    input: entries,
    output: [
      {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
      {
        // .cjs, not .js: the package is "type": "module", so .js would load as ESM.
        dir: 'dist',
        format: 'cjs',
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name]-[hash].cjs',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        emitDeclarationOnly: false,
      }),
      terser({ format: { preserve_annotations: true } }),
      clientDirective(),
    ],
  },
  ...types,
];
