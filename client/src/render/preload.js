const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  onKeyDown: (e) => ipcRenderer.on('keydown', (event, payload)=> e(payload)),
  focusWindow: () => ipcRenderer.send('focusWindow'),
  blurWindow: () => ipcRenderer.send('blurWindow'),

  onFocus: (e) => ipcRenderer.on('focused', e),
  onBlur: (e) => ipcRenderer.on('blurred', e),
})