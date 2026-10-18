const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { Auth } = require('msmc');
const { Client, Authenticator } = require('minecraft-launcher-lib');
const os = require('os');
const fs = require('fs');

let win;
const minecraftPath = path.join(os.homedir(), '.evolumc');
let authToken = null;

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 620,
    minWidth: 860,
    minHeight: 560,
    frame: false,
    resizable: true,
    backgroundColor: '#0a0c10',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

/* ── Window controls ── */
ipcMain.on('win-min',   () => win.minimize());
ipcMain.on('win-max',   () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('win-close', () => app.quit());

/* ── Microsoft Login ── */
ipcMain.handle('auth-microsoft', async () => {
  try {
    const authManager = new Auth('select_account');
    const xboxManager = await authManager.launch('electron');
    const token = await xboxManager.getMinecraft();
    authToken = token;
    return {
      success: true,
      username: token.profile.name,
      uuid: token.profile.id,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

/* ── Launch Minecraft ── */
ipcMain.handle('launch-minecraft', async (event, version) => {
  if (!authToken) return { success: false, error: 'Non connecté' };

  // Ensure minecraft dir exists
  if (!fs.existsSync(minecraftPath)) fs.mkdirSync(minecraftPath, { recursive: true });

  const opts = {
    clientPackage: null,
    authorization: authToken.mclc(),
    root: minecraftPath,
    version: {
      number: version,
      type: 'release',
    },
    memory: {
      max: '4G',
      min: '1G',
    },
    customLaunchArgs: [
      '--username', authToken.profile.name,
    ],
    window: {
      width: 1280,
      height: 720,
    },
  };

  const launcher = new Client();

  launcher.on('debug',    (e) => win.webContents.send('mc-debug', e));
  launcher.on('data',     (e) => win.webContents.send('mc-data', e));
  launcher.on('progress', (e) => win.webContents.send('mc-progress', e));
  launcher.on('download-status', (e) => win.webContents.send('mc-download', e));
  launcher.on('close',    (code) => win.webContents.send('mc-close', code));

  try {
    await launcher.launch(opts);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

/* ── Get installed versions ── */
ipcMain.handle('get-versions', async () => {
  try {
    const { getVersionList } = require('minecraft-launcher-lib');
    const list = await getVersionList();
    return list.versions
      .filter(v => v.type === 'release')
      .slice(0, 12)
      .map(v => ({ id: v.id, type: v.type }));
  } catch (e) {
    return [];
  }
});
