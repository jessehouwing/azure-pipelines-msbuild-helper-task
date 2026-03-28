import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/vsts-msbuild-helper.ts',
  output: {
    file: 'dist/vsts-msbuild-helper.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      composite: false,
      incremental: false,
      // Rollup handles module resolution and bundling; ESNext lets rollup tree-shake
      module: 'ESNext',
      moduleResolution: 'Bundler',
      outDir: 'dist',
    }),
  ],
};
