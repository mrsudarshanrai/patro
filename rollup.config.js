import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// Components use hooks, so React Server Components must treat the package as client code.
// Added after terser, which drops unknown directives.
const clientDirective = () => ({
  name: 'use-client',
  renderChunk: (code) => ({ code: `'use client';\n${code}`, map: null }),
});
export default [
  {
    input: './index.ts',
    output: [
      {
        // .cjs, not .js: the package is "type": "module", so .js would load as ESM.
        file: 'dist/index.cjs',
        format: 'cjs',
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
        exports: 'named',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      terser(),
      clientDirective(),
    ],
  },
];
