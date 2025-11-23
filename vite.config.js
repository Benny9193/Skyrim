import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing.html'),
        bestiary: resolve(__dirname, 'bestiary.html'),
        character: resolve(__dirname, 'character.html')
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 3000,
    open: '/landing.html',
    cors: true
  },

  preview: {
    port: 8080
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@js': resolve(__dirname, './js'),
      '@css': resolve(__dirname, './css'),
      '@models': resolve(__dirname, './models'),
      '@data': resolve(__dirname, './data')
    }
  },

  optimizeDeps: {
    include: ['three']
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'characters.json',
          dest: '.'
        },
        {
          src: 'reconstruction_data.json',
          dest: '.'
        },
        {
          src: '*.obj',
          dest: '.'
        },
        {
          src: '*.ply',
          dest: '.'
        }
      ]
    })
  ]
});
