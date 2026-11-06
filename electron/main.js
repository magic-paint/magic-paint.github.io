// Magic Paint — desktop shell (Electron).
// Serves the web app in /app from a private "app://" origin so audio, storage and fonts
// work exactly as they do on the web, fully offline.
'use strict';

const { app, BrowserWindow, Menu, dialog, ipcMain, net, protocol, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');

const APP_DIR = path.join(__dirname, '..', 'app');
const ORIGIN = 'app://magic-paint';
const isMac = process.platform === 'darwin';
const HOMEPAGE = require('../package.json').homepage || 'https://github.com';

app.setName('Magic Paint');
if (process.platform === 'win32') app.setAppUserModelId('com.magicpaint.app');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

// One window only: a second launch just brings the existing one forward.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
}

function serveApp() {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const file = path.normalize(path.join(APP_DIR, rel));
    if (!file.startsWith(APP_DIR + path.sep)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
}

ipcMain.handle('save-png', async (event, name, buffer) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    const base = String(name || 'my-painting.png').replace(/[^\w.\- ]+/g, '').replace(/\.png$/i, '') || 'my-painting';
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save your painting',
      defaultPath: path.join(app.getPath('pictures'), `${base} ${stamp()}.png`),
      filters: [{ name: 'PNG image', extensions: ['png'] }]
    });
    if (canceled || !filePath) return { canceled: true };
    await fs.writeFile(filePath, Buffer.from(buffer));
    return { ok: true, path: filePath };
  } catch (err) {
    return { error: String(err && err.message || err) };
  }
});

function buildMenu() {
  if (!isMac) { Menu.setApplicationMenu(null); return; }
  // Undo/Redo are handled inside the app (Cmd+Z / Shift+Cmd+Z), so no Edit menu here.
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { label: 'View', submenu: [{ role: 'togglefullscreen' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { role: 'windowMenu' },
    { role: 'help', submenu: [{ label: 'Magic Paint Website', click: () => shell.openExternal(HOMEPAGE) }] }
  ]));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 900,
    minHeight: 620,
    show: false,
    title: 'Magic Paint',
    backgroundColor: '#CBDCFF',
    icon: process.platform === 'linux' ? path.join(__dirname, '..', 'build', 'icon.png') : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  win.once('ready-to-show', () => win.show());

  // Kids can't wander off: no new windows, no navigation away from the app.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN)) e.preventDefault(); });

  // F11 / Ctrl+Cmd+F toggles full screen on every platform; devtools only when unpackaged.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (!app.isPackaged && input.key === 'F12') win.webContents.toggleDevTools();
  });

  win.loadURL(`${ORIGIN}/index.html`);
  return win;
}

app.whenReady().then(() => {
  serveApp();
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => app.quit());
