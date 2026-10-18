const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('evolumc', {
  // Window controls
  winMin:   () => ipcRenderer.send('win-min'),
  winMax:   () => ipcRenderer.send('win-max'),
  winClose: () => ipcRenderer.send('win-close'),

  // Auth
  authMicrosoft: () => ipcRenderer.invoke('auth-microsoft'),

  // Launch
  launchMinecraft: (version) => ipcRenderer.invoke('launch-minecraft', version),

  // Versions
  getVersions: () => ipcRenderer.invoke('get-versions'),

  // Events from main → renderer
  on: (channel, cb) => ipcRenderer.on(channel, (_, data) => cb(data)),
});
