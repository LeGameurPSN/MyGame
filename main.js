const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os   = require('os');
const fs   = require('fs');

let win;
const ROOT = path.join(os.homedir(), '.evolumc');
let mclcAuth = null;

function createWindow() {
  win = new BrowserWindow({
    width: 960, height: 620,
    minWidth: 860, minHeight: 560,
    frame: false,
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

/* ── Microsoft Auth (msmc v4 + mclc) ── */
ipcMain.handle('auth-microsoft', async () => {
  try {
    const { Auth } = require('msmc');
    const authManager = new Auth('select_account');
    const xboxManager = await authManager.launch('electron');
    const token = await xboxManager.getMinecraft();

    // mclc() converts the msmc token into a minecraft-launcher-core auth object
    mclcAuth = token.mclc();

    return {
      success:  true,
      username: token.profile.name,
      uuid:     token.profile.id,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

/* ── Launch Minecraft ── */
ipcMain.handle('launch-minecraft', async (event, version) => {
  if (!mclcAuth) return { success: false, error: 'Non connecté.' };
  if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

  try {
    const { Client } = require('minecraft-launcher-core');
    const launcher = new Client();

    const opts = {
      authorization: mclcAuth,
      root:    ROOT,
      version: { number: version, type: 'release' },
      memory:  { max: '4G', min: '1G' },
      window:  { width: 1280, height: 720 },
    };

    launcher.on('debug',           (e) => win.webContents.send('mc-data', e));
    launcher.on('data',            (e) => win.webContents.send('mc-data', e));
    launcher.on('progress',        (e) => win.webContents.send('mc-progress', e));
    launcher.on('download-status', (e) => win.webContents.send('mc-download', e));
    launcher.on('close',           (c) => win.webContents.send('mc-close', c));

    await launcher.launch(opts);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
