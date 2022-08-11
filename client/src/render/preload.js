const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  

  onKeyDown: (e) => ipcRenderer.on('keydown', (event, payload)=> e(payload)),
  onKeyUp: (e) => ipcRenderer.on('keyup', (event, payload)=> e(payload)),
  onMouseWheel: (e) => ipcRenderer.on('wheel', (event, payload)=> e(payload)),

  focusWindow: () => ipcRenderer.send('focusWindow'),
  blurWindow: () => ipcRenderer.send('blurWindow'),

  onFocus: (e) => ipcRenderer.on('focused', e),
  onBlur: (e) => ipcRenderer.on('blurred', e),


  setIgnoreMouseEvents: (username) => ipcRenderer.send('setIgnoreMouseEvents', username),
  getCurrentPos: (e) => ipcRenderer.invoke('getCurrentPos', e),

  setUsername: (username) => ipcRenderer.send('setUsername', username),
  getUsername: () => ipcRenderer.invoke('getUsername'),
  setColor: (color) => ipcRenderer.send('setColor', color),
  getColor: () => ipcRenderer.invoke('getColor'),
  
  setPos: (pos) => ipcRenderer.send('setPos', pos),
  getPos: () => ipcRenderer.invoke('getPos'),

  setKeyBinds: (keyBinds) => ipcRenderer.send('setKeyBinds', keyBinds),
  getKeyBinds: () => ipcRenderer.invoke('getKeyBinds'),
  
  
  setIp: (ip) => ipcRenderer.send('setIp', ip),
  getIp: () => ipcRenderer.invoke('getIp'),
  exitOverlay: () => ipcRenderer.send('exitOverlay'),




})
