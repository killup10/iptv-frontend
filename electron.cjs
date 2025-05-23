const { app, BrowserWindow, session, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let mainWindow;
const isDev = !app.isPackaged;
const appVersion = app.getVersion();
const finalUserAgentString = `TeamGDesktopApp/${appVersion}`;

function log(msg) {
  console.log(msg);
}

// Configurar ffmpeg.dll si está presente
const ffmpegPath = path.join(__dirname, 'ffmpeg_custom_packaged', 'ffmpeg.dll');
if (fs.existsSync(ffmpegPath)) {
  app.commandLine.appendSwitch('no-sandbox');
  log('✅ ffmpeg.dll detectado y configurado: ' + ffmpegPath);
} else {
  log('⚠️ No se encontró ffmpeg.dll en: ' + ffmpegPath);
}

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

  const startURL = isDev
    ? 'http://localhost:5173'
    : path.join(__dirname, 'dist', 'index.html');

  if (isDev) {
    mainWindow.loadURL(startURL);
  } else {
    mainWindow.loadFile(startURL);
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log(`[ERROR] No se pudo cargar ${validatedURL}: ${errorDescription} (${errorCode})`);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    log('Ventana cerrada.');
  });
}

app.whenReady().then(() => {
  log(`App lista. isDev = ${isDev}`);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp']
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  log(`[ERROR] ${error.message}\n${error.stack}`);
  if (app && app.isReady()) {
    const { dialog } = require('electron');
    dialog.showErrorBox('Error inesperado (main process)', error.message);
  }
});
