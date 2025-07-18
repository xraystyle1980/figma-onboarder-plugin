const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'code.js',
  loader: { '.html': 'text' },
  platform: 'node',
  target: ['es6'],
  sourcemap: true,
  logLevel: 'info',
  format: 'cjs',
}).catch(() => process.exit(1)); 