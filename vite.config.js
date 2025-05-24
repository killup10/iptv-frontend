// iptv-frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
// import { viteStaticCopy } from 'vite-plugin-static-copy'; // Descomenta si necesitas copiar archivos WASM de VLC

export default defineConfig(({ command }) => {
  // Determina la 'base' URL dinámicamente: '/' para desarrollo, './' para producción.
  // Esto es crucial para que las rutas de los assets funcionen correctamente en Electron después de empaquetar.
  const base = command === 'serve' ? '/' : './';

  return {
    base: base, // Establece la base para las URLs de los assets
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
        // Configura un alias '@' para apuntar al directorio 'src'
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      // Directorio de salida para los archivos de producción
      outDir: 'dist',
    },
    server: {
      // Puerto para el servidor de desarrollo Vite
      port: 5173, // Asegúrate que este puerto coincida con el de wait-on en package.json
      // Descomenta si necesitas cabeceras COOP/COEP para el servidor de desarrollo (ej. para SharedArrayBuffer)
      // headers: {
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      //   'Cross-Origin-Embedder-Policy': 'require-corp',
      // },
    },
    preview: { // Configuración para el servidor de vista previa (comando 'vite preview')
      // Descomenta si también necesitas cabeceras COOP/COEP para el servidor de vista previa
      // headers: {
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      //   'Cross-Origin-Embedder-Policy': 'require-corp',
      // },
    }
  };
});