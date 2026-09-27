import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import scss from 'rollup-plugin-scss';
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
      scss({
        fileName: 'css/style.css',
        failOnError: true,
        outputStyle: 'compressed',
      }),
      terser(),
    ],
  },
];
