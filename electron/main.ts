import { app, BrowserWindow } from 'electron'
import path from 'node:path'

// Definimos las rutas de dist
// Nota: __dirname en production apunta a dist-electron/
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged 
  ? process.env.DIST 
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// Vite dev server URL
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    // CORRECCIÓN 1: Agregamos " || '' " para evitar error de TypeScript
    title: 'JossLife - Manager',
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    show: false, // 1. Ocultar al inicio para evitar flash blanco
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // 2. Maximizar y mostrar cuando esté listo
  win.maximize()
  win.show()

  // Test log para saber si entra aquí
  console.log('Creando ventana...', VITE_DEV_SERVER_URL)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // CORRECCIÓN 2: Agregamos " || '' " aquí también
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
