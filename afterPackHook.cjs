// iptv-frontend/afterPackHook.cjs
const fs = require('node:fs');
const path = require('node:path');
const util = require('node:util'); // Para una inspección más segura

exports.default = async function(context) {
  console.log('Ejecutando afterPack hook para reemplazar FFmpeg...');

  // ---- Depuración del objeto context de forma más segura ----
  console.log('Inspeccionando claves principales del objeto context:');
  if (context) {
    for (const key in context) {
      if (Object.hasOwnProperty.call(context, key)) {
        // Evitar imprimir objetos muy grandes o con posible estructura circular directamente
        if (typeof context[key] === 'object' && context[key] !== null) {
          console.log(`  context.${key}: [Object]`); // Solo indica que es un objeto
        } else {
          console.log(`  context.${key}:`, context[key]);
        }
      }
    }

    // Intentar imprimir específicamente la parte de 'packager' y 'platform' si existen
    if (context.packager && context.packager.platform) {
      console.log('Inspeccionando context.packager.platform:');
      // Usar util.inspect para manejar mejor objetos complejos y circulares (limitando la profundidad)
      console.log(util.inspect(context.packager.platform, { showHidden: false, depth: 2, colors: false }));
    } else {
      console.log('  context.packager o context.packager.platform no está definido.');
    }
    if (context.platform) { // Para ver si context.platform existe directamente
        console.log('Inspeccionando context.platform (si existe):');
        console.log(util.inspect(context.platform, { showHidden: false, depth: 2, colors: false }));
    }

  } else {
    console.error('  Error Crítico: El objeto context es undefined.');
    return;
  }
  // ---- Fin de la depuración ----


  const packager = context.packager;
  // Verificación robusta de la existencia de packager y packager.platform
  if (!packager || typeof packager !== 'object' || !packager.platform || typeof packager.platform !== 'object') {
    console.error('  Error Crítico: context.packager o context.packager.platform no tiene la estructura esperada.');
    console.log('  Revisa la inspección del "context" arriba para entender su estructura real.');
    return;
  }

  // Usaremos packager.platform.nodeName que es más estándar (ej. 'win32', 'darwin', 'linux')
  // o packager.platform.name si nodeName no está.
  const platformName = packager.platform.nodeName || packager.platform.name;
  const appOutDir = context.appOutDir;

  if (!platformName || !appOutDir) {
    console.error('  Error Crítico: No se pudo determinar platformName o appOutDir desde el contexto.');
    return;
  }

  console.log(`  Plataforma detectada: ${platformName}`);
  console.log(`  Directorio de salida de la app (appOutDir): ${appOutDir}`);

  let ffmpegFileName;
  let customFfmpegSourcePath;
  let electronFfmpegDestPath;

  if (platformName === 'win32' || platformName === 'win') {
    ffmpegFileName = 'ffmpeg.dll';
    customFfmpegSourcePath = path.join(appOutDir, 'ffmpeg_custom_packaged', ffmpegFileName);
    electronFfmpegDestPath = path.join(appOutDir, ffmpegFileName);
  } else if (platformName === 'darwin' || platformName === 'mac') {
    ffmpegFileName = 'libffmpeg.dylib';
    // productFilename podría no estar en appInfo si packager.appInfo no existe, usar un nombre genérico o investigar más el context
    const appName = (packager.appInfo && packager.appInfo.productFilename) ? packager.appInfo.productFilename : context.packager.appInfo.productName; // Fallback
    if (!appName) {
        console.error('  Error Crítico: No se pudo determinar el nombre de la aplicación para macOS.');
        return;
    }
    customFfmpegSourcePath = path.join(appOutDir, `${appName}.app`, 'Contents', 'ffmpeg_custom_packaged', ffmpegFileName);
    electronFfmpegDestPath = path.join(appOutDir, `${appName}.app`, 'Contents', 'Frameworks', 'Electron Framework.framework', 'Versions', 'A', 'Libraries', ffmpegFileName);
  } else if (platformName === 'linux') {
    ffmpegFileName = 'libffmpeg.so';
    customFfmpegSourcePath = path.join(appOutDir, 'ffmpeg_custom_packaged', ffmpegFileName);
    electronFfmpegDestPath = path.join(appOutDir, ffmpegFileName);
  } else {
    console.warn(`  Plataforma no soportada o no reconocida para reemplazo de FFmpeg: ${platformName}`);
    return;
  }

  console.log(`  Intentando reemplazar FFmpeg para la plataforma: ${platformName}`);
  console.log(`    Ruta de FFmpeg personalizado (fuente): ${customFfmpegSourcePath}`);
  console.log(`    Ruta de FFmpeg de Electron (destino): ${electronFfmpegDestPath}`);

  if (fs.existsSync(customFfmpegSourcePath)) {
    try {
      const destDir = path.dirname(electronFfmpegDestPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`    Directorio de destino creado: ${destDir}`);
      }
      fs.copyFileSync(customFfmpegSourcePath, electronFfmpegDestPath);
      console.log(`    ¡${ffmpegFileName} reemplazado exitosamente!`);
    } catch (err) {
      console.error(`    Error al reemplazar ${ffmpegFileName}:`, err);
    }
  } else {
    console.warn(`    FFmpeg personalizado no encontrado en ${customFfmpegSourcePath}. No se reemplazó nada.`);
    console.warn(`    Asegúrate de que 'extraResources' en tu package.json esté configurado para copiar desde la carpeta 'ffmpeg_custom' a 'ffmpeg_custom_packaged', y que el archivo FFmpeg exista en 'ffmpeg_custom'.`);
  }
};
