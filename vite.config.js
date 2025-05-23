// iptv-frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
// import { viteStaticCopy } from 'vite-plugin-static-copy'; // Descomenta si necesitas copiar archivos WASM de VLC

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : './';

  return {
    base: base,
    plugins: [
      react(),
      // Descomenta y configura si necesitas copiar archivos WASM de VLC a 'dist'
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: 'ruta/a/tus/archivos-vlc-wasm/**/*', // ej: 'src/lib/vlc-wasm/**/*'
      //       dest: 'vlc-wasm' // Se copiarán a dist/vlc-wasm
      //     }
      //   ]
      // })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 5173, // Asegúrate que este puerto coincida con el de wait-on en package.json
      // Descomenta si necesitas cabeceras COOP/COEP para el servidor de desarrollo (ej. para SharedArrayBuffer)
      // headers: {
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      //   'Cross-Origin-Embedder-Policy': 'require-corp',
      // },
    },
    preview: { // También para el servidor de preview si lo usas
      // headers: {
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      //   'Cross-Origin-Embedder-Policy': 'require-corp',
      // },
    }
  };
});
