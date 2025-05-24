// electron.cjs
const { app, BrowserWindow, session, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let mainWindow; // Asegúrate de que mainWindow esté declarada si la usas globalmente

const isDev = !app.isPackaged; // Determina si está en desarrollo o producción
const appVersion = app.getVersion();
const finalUserAgentString = `TeamGDesktopApp/${appVersion}`;

function log(msg) {
  console.log(`[MainProcess] ${new Date().toISOString()}: ${msg}`);
}

// --- INICIO DE LA MODIFICACIÓN PARA FFmpeg ---
log('Configurando ruta para ffmpeg.dll...');

// process.resourcesPath apunta a la carpeta 'resources' en producción.
// En desarrollo, __dirname es la raíz del proyecto (iptv-frontend).
// Asumimos que tu ffmpeg.dll original (antes de ser copiado por extraResources)
// está en 'ffmpeg_custom/ffmpeg.dll' relativo a la raíz del proyecto.
const ffmpegDirectoryName = 'ffmpeg_custom_packaged'; // El directorio 'to' de extraResources
const ffmpegFileName = 'ffmpeg.dll';

let ffmpegPathUserProvided;

if (isDev) {
  // En desarrollo, podrías querer simular la estructura o apuntar al original.
  // Para este ejemplo, apuntaremos a la fuente original que extraResources usaría.
  // O, si tu hook afterPack ya lo reemplaza en el Electron de desarrollo,
  // esta lógica de detección en dev podría ser menos crítica.
  // Por simplicidad, aquí solo logueamos que en dev se usaría el ffmpeg de Electron (potencialmente reemplazado).
  log(`  Modo Desarrollo: Se asume que FFmpeg (original o reemplazado por hook) está en la ruta de Electron.`);
  // Si necesitas verificar el DLL original en desarrollo:
  // ffmpegPathUserProvided = path.join(__dirname, 'ffmpeg_custom', ffmpegFileName);
} else {
  // En producción, process.resourcesPath es la carpeta 'resources' de la app.
  ffmpegPathUserProvided = path.join(process.resourcesPath, ffmpegDirectoryName, ffmpegFileName);
}

if (!isDev && ffmpegPathUserProvided) {
  log(`  Modo Producción: Buscando ffmpeg.dll personalizado en: ${ffmpegPathUserProvided}`);
  if (fs.existsSync(ffmpegPathUserProvided)) {
    // Considera cuidadosamente si 'no-sandbox' es necesario y sus implicaciones de seguridad.
    // A menudo, el reemplazo de ffmpeg.dll por el hook afterPack es suficiente para que Electron lo use.
    // app.commandLine.appendSwitch('no-sandbox');
    log(`  ✅ ffmpeg.dll personalizado encontrado en producción: ${ffmpegPathUserProvided}`);
    // Aquí podrías hacer algo con esta ruta si tu aplicación la necesita directamente.
  } else {
    log(`  ⚠️ No se encontró ffmpeg.dll personalizado en producción en: ${ffmpegPathUserProvided}`);
  }
}
// --- FIN DE LA MODIFICACIÓN PARA FFmpeg ---

function createWindow() {
  // En producción, __dirname es [RAÍZ_APP_EMPAQUETADA]/resources/app.asar/
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

  // En producción, __dirname es [RAÍZ_APP_EMPAQUETADA]/resources/app.asar/
  // Tu frontend (React/Vite) se compila en la carpeta 'dist'.
  const prodIndexPath = path.join(__dirname, 'dist', 'index.html'); // Ruta: .../app.asar/dist/index.html

  const startURL = isDev
    ? 'http://localhost:5173' // Servidor de desarrollo de Vite
    : `file://${prodIndexPath}`; // Carga el index.html desde la carpeta dist empaquetada

  log(`Intentando cargar URL: ${startURL}`);

  if (isDev) {
    mainWindow.loadURL(startURL).catch(err => log(`Error al cargar URL (dev): ${err}`));
  } else {
    mainWindow.loadFile(prodIndexPath).catch(err => log(`Error al cargar archivo (prod): ${err}`));
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log(`[ERROR AL CARGAR VENTANA] No se pudo cargar ${validatedURL}: ${errorDescription} (Código: ${errorCode})`);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

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
  log(`App lista. isDev = ${isDev}, Versión App: ${appVersion}`);

  // Configuración de cabeceras COOP/COEP (si las necesitas para SharedArrayBuffer, etc.)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp' // O 'credentialless' si es más apropiado
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
    const { dialog } = require('electron'); // require aquí para evitar errores si app no está lista
    dialog.showErrorBox('Error inesperado en el proceso principal', `${error.name}: ${error.message}\n${error.stack}`);
  }
  // Considera cerrar la aplicación aquí si el error es crítico
  // process.exit(1);
});
