import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // --- ESTA ES LA LÍNEA MÁGICA ---
  // Hace que los archivos se busquen de forma relativa. 
  // Sin esto, tu .exe mostrará una pantalla blanca.
  base: './', 
  // -------------------------------

  plugins: [
    react(),
    electron({
      main: {
        // Ruta explícita a tu archivo main.ts
        entry: 'electron/main.ts',
        vite: {
          build: {
            // Forzamos la salida a dist-electron/main.js
            outDir: 'dist-electron',
          },
        },
      },
      preload: {
        input: 'electron/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
