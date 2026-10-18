const { app, BrowserWindow, ipcMain } = require('electron');
const path  = require('path');
const os    = require('os');
const fs    = require('fs');

let win;
const ROOT = path.join(os.homedir(), '.evolumc');
let authResult = null;

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

/* Window controls */
ipcMain.on('win-min',   () => win.minimize());
ipcMain.on('win-max',   () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('win-close', () => app.quit());

/* Microsoft Auth via msmc */
ipcMain.handle('auth-microsoft', async () => {
  try {
    const { msmc } = require('msmc');
    const result = await msmc.fastLaunch('electron', (update) => {
      win.webContents.send('auth-update', update.toString());
    });
    if (msmc.errorCheck(result)) {
      return { success: false, error: 'Connexion annulée ou échouée.' };
    }
    const token = msmc.getMCLC().getAuth(result);
    authResult = token;
    return {
      success: true,
      username: token.name,
      uuid: token.uuid,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

/* Launch Minecraft */
ipcMain.handle('launch-minecraft', async (event, version) => {
  if (!authResult) return { success: false, error: 'Non connecté.' };
  if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

  try {
    const { install, getVersionList } = require('@xmcl/installer');
    const { MinecraftFolder, launch } = require('@xmcl/core');

    const folder = MinecraftFolder.from(ROOT);

    /* 1. Download version if needed */
    win.webContents.send('mc-status', 'Vérification de la version ' + version + '…');
    const versionList = await getVersionList();
    const versionMeta = versionList.versions.find(v => v.id === version);
    if (!versionMeta) return { success: false, error: 'Version introuvable : ' + version };

    await install(versionMeta, folder, {
      onProgress: (task) => {
        win.webContents.send('mc-progress', {
          name: task.path,
          current: task.progress,
          total: task.total,
        });
      },
    });

    win.webContents.send('mc-status', 'Lancement de Minecraft…');

    /* 2. Launch */
    const proc = await launch({
      gamePath: ROOT,
      javaPath: 'java',
      version: version,
      gameProfile: {
        id: authResult.uuid,
        name: authResult.name,
      },
      accessToken: authResult.access_token,
      userType: 'msa',
      resolution: { width: 1280, height: 720 },
      extraExecOption: {
        detached: true,
      },
    });

    proc.stdout.on('data', d => win.webContents.send('mc-data', d.toString()));
    proc.stderr.on('data', d => win.webContents.send('mc-data', d.toString()));
    proc.on('close', code => win.webContents.send('mc-close', code));

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
