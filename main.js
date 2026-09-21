const { app, BrowserWindow, Menu, protocol, net, shell } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

const APP_DIR = path.join(__dirname, 'app')
const ICON_PATH = path.join(__dirname, 'build', 'icon.ico')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
])

function resolveFilePath(pathname) {
  let relative = decodeURIComponent(pathname)
  if (relative.startsWith('/')) relative = relative.slice(1)
  if (relative === '') relative = 'index.html'

  let filePath = path.normalize(path.join(APP_DIR, relative))
  if (!filePath.startsWith(APP_DIR)) filePath = path.join(APP_DIR, 'index.html')
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(APP_DIR, 'index.html')
  }
  return filePath
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 720,
    minHeight: 560,
    icon: ICON_PATH,
    backgroundColor: '#0f1012',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.setMenuBarVisibility(false)
  win.loadURL('app://holy/')

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  return win
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url)
    const filePath = resolveFilePath(pathname)
    return net.fetch(pathToFileURL(filePath).toString())
  })

  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
