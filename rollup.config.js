import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import scss from 'rollup-plugin-scss';
import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
export default [
  {
    input: './index.ts',
    output: [
      {
        // .cjs is required (not .js) because the package is "type": "module" -
        // a plain .js file here would be loaded as ESM, silently discarding
        // this bundle's require()/exports.X = ... CommonJS syntax.
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
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react'],
      }),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      scss({
        // rollup-plugin-scss v4 renamed the string-path output option to
        // `fileName` (relative to the rollup output dir) - `output` is now
        // either a callback or `false`; passing it a string here silently
        // did nothing and the plugin fell back to a hashed asset filename,
        // so dist/css/style.css (the path package.json's "files" and
        // consumers rely on) was never actually produced.
        fileName: 'css/style.css',
        failOnError: true,
        outputStyle: 'compressed',
      }),
      terser(),
      copy({
        targets: [
          {
            src: './package.json',
            dest: 'dist/',
          },
        ],
      }),
    ],
  },
];
