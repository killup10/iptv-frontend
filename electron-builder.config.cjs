// electron-builder.config.js
module.exports = {
  appId: "com.teamg.play.desktop",
  productName: "TeamG Play Desktop",
  files: [
    "dist/**/*",
    "electron.cjs",
    "package.json",
    "preload.cjs",
    "node_modules/electron/dist/**"
  ],
  extraResources: [
    {
      from: "ffmpeg_custom/ffmpeg.dll",
      to: "ffmpeg_custom_packaged",
      filter: ["**/*"]
    },
    {
      from: "public/vite.svg",
      to: "vite.svg"
    }
  ],
  afterPack: "./afterPackHook.cjs",
  directories: {
    buildResources: "assets_electron",
    output: "release_electron"
  },
  win: {
    target: "nsis",
    icon: "assets_electron/icon.ico"
  },
  mac: {
    target: "dmg",
    icon: "assets_electron/icon.icns",
    category: "public.app-category.entertainment"
  },
  linux: {
    target: "AppImage",
    icon: "assets_electron/icon.png"
  }
};
