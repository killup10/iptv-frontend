// electron.cjs
const { app, BrowserWindow, session, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs'); // <-- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ DESCOMENTADA

let mainWindow;

// --- MODIFICACIÓN TEMPORAL PARA FORZAR MODO PRODUCCIÓN ---
// const isDev = !app.isPackaged; // Comentamos la detección automática
const isDev = false; // ¡FORZAMOS isDev a false para esta prueba!
// --- FIN DE LA MODIFICACIÓN TEMPORAL ---

const appVersion = app.getVersion();
const finalUserAgentString = `TeamGDesktopApp/${appVersion}`;

function log(msg) {
  console.log(`[MainProcess] ${new Date().toISOString()}: ${msg}`);
}

// --- LÓGICA DE FFmpeg ---
log('Configurando ruta para ffmpeg.dll...');
const ffmpegDirectoryName = 'ffmpeg_custom_packaged';
const ffmpegFileName = 'ffmpeg.dll';
let ffmpegPathUserProvided;

if (isDev) {
  log(`   Modo Desarrollo (FORZADO A NO SER): Se asume que FFmpeg está en la ruta de Electron.`);
} else {
  // En producción (o cuando isDev es false), process.resourcesPath es la carpeta 'resources'
  // Esta ruta es para cuando la app está empaquetada.
  // Cuando corres `electron .` con `isDev = false`, `process.resourcesPath`
  // apuntará a `node_modules/electron/dist/resources`.
  ffmpegPathUserProvided = path.join(process.resourcesPath, ffmpegDirectoryName, ffmpegFileName);
}

if (!isDev && ffmpegPathUserProvided) { // Esta condición ahora será true
  log(`   Modo Producción (FORZADO): Buscando ffmpeg.dll personalizado en: ${ffmpegPathUserProvided}`);
  if (fs.existsSync(ffmpegPathUserProvided)) { // fs.existsSync ahora debería funcionar
    log(`   ✅ ffmpeg.dll personalizado encontrado en: ${ffmpegPathUserProvided}`);
  } else {
    log(`   ⚠️ No se encontró ffmpeg.dll personalizado en: ${ffmpegPathUserProvided}. Electron usará su ffmpeg.dll por defecto (la que reemplazaste en node_modules/electron/dist si lo hiciste).`);
  }
}
// --- FIN DE LA LÓGICA DE FFmpeg ---

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      userAgent: finalUserAgentString,
    }
  });

  const prodIndexPath = path.join(__dirname, 'dist', 'index.html');

  log(`Intentando cargar URL (MODO PRODUCCIÓN FORZADO): ${prodIndexPath}`);

  // La rama 'else' siempre se ejecutará ahora porque isDev = false
  mainWindow.loadFile(prodIndexPath).catch(err => log(`Error al cargar archivo (prod - forzado): ${err.toString()}`));

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log(`[ERROR AL CARGAR VENTANA] No se pudo cargar ${validatedURL}: ${errorDescription} (Código: ${errorCode})`);
  });

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    log('Ventana cerrada.');
  });
}

app.whenReady().then(() => {
  log(`App lista. isDev = ${isDev} (FORZADO), Versión App: ${appVersion}`);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  log(`[ERROR NO CAPTURADO] ${error.message}\n${error.stack}`);
  if (app && app.isReady()) {
    const { dialog } = require('electron');
    dialog.showErrorBox('Error inesperado en el proceso principal', `${error.name}: ${error.message}\n${error.stack}`);
  }
});
