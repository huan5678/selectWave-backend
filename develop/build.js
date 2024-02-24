import * as esbuild from 'esbuild';

esbuild
  .build({
    bundle: true,
    minify: process.env.NODE_ENV==='production' ? true : false,
    entryPoints: ['src/app/server.ts'],
    outfile: 'dist/index.js',
    format: 'esm',
    platform: 'node',
    packages: 'external',
  })
  .catch(() => process.exit(1));
