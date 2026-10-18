const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 940,
    height: 600,
    minWidth: 800,
    minHeight: 520,
    frame: false,           // On utilise notre propre barre de titre
    resizable: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0c10',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  win.loadFile('index.html');

  // Afficher la fenêtre une fois chargée (évite le flash blanc)
  win.once('ready-to-show', () => {
    win.show();
  });

  // Empêcher la navigation externe
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Gestion des boutons de la barre de titre custom
ipcMain.on('window-min',   () => win.minimize());
ipcMain.on('window-max',   () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('window-close', () => win.close());
