import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import scss from 'rollup-plugin-scss'
import { babel } from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy';
export default [
  {
    input: './index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
        exports: 'named'
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react']
      }),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      scss({
        output: './dist/css/style.css',
        failOnError: true,
        outputStyle: 'compressed',
      }),
      terser(),
      copy({
        targets: [
          {
            src: './package.json', dest: 'dist/'
          },
        ]
      })
    ],
  },
];