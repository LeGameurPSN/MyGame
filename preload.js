const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('evolumc', {
  winMin:   () => ipcRenderer.send('win-min'),
  winMax:   () => ipcRenderer.send('win-max'),
  winClose: () => ipcRenderer.send('win-close'),

  authMicrosoft:   ()      => ipcRenderer.invoke('auth-microsoft'),
  launchMinecraft: (ver)   => ipcRenderer.invoke('launch-minecraft', ver),

  on: (ch, cb) => ipcRenderer.on(ch, (_, data) => cb(data)),
});
