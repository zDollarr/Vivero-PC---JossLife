"use strict";
const electron = require("electron");
const path = require("node:path");
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
    // CORRECCIÓN 1: Agregamos " || '' " para evitar error de TypeScript
    title: "JossLife - Manager",
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    show: false,
    // 1. Ocultar al inicio para evitar flash blanco
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.maximize();
  win.show();
  console.log("Creando ventana...", VITE_DEV_SERVER_URL);
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(createWindow);
