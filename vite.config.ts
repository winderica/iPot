import { defineConfig } from 'vite';

import { compilerOptions } from './tsconfig.json';

export default defineConfig({
  resolve: {
    alias: Object.fromEntries(
      Object.entries(compilerOptions.paths).map(([key, value]) =>
        [key.replace('*', ''), `/${value[0].replace('*', '')}`],
      ),
    ),
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        background: 'pages/background.html',
        options: 'pages/options.html',
        popup: 'pages/popup.html',
        content: 'src/content.tsx',
        contentLoader: 'src/contentLoader.ts',
      },
      output: {
        chunkFileNames: 'dist/[name].[hash].js',
        entryFileNames: 'dist/[name].js',
      },
    },
    minify: 'esbuild',
    target: 'esnext',
  },
});
