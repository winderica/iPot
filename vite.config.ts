import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        background: 'pages/background.html',
        options: 'pages/options.html',
        popup: 'pages/popup.html',
        content: 'src/content.ts',
        contentLoader: 'src/contentLoader.ts',
      },
      output: {
        chunkFileNames: 'dist/[name].[hash].js',
        entryFileNames: 'dist/[name].js',
      },
    },
    minify: 'esbuild',
    target: 'esnext',
    watch: {},
  },
});
