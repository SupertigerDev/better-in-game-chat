const { uIOhook, UiohookKey } = require('uiohook-napi');
const forceFocus = require('forcefocus');
const {BrowserWindow, app, globalShortcut} = require("electron");
const path = require("path");
const { ipcMain } = require('electron')
const processWindows = require("node-process-windows");
const Store = require('electron-store');
const { windowManager } = require("node-window-manager");


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit();
  return;
}

const store = new Store();


const ready = () => {
  
  
  let gameProcessId = null

  const win = windowManager.getActiveWindow();
  gameProcessId = win.processId



  const window = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    skipTaskbar: true,
    focusable: false,
    x: 10,
    y: 600,
    transparent: true,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(__dirname, "render",'preload.js'),
    },
  });


  window.setAlwaysOnTop(true, "level");
  let isFocused = window.isFocused();

  const values = Object.values(UiohookKey);
  const keys = Object.keys(UiohookKey);

  uIOhook.on('keydown', (e) => {
    const index = values.indexOf(e.keycode);
    const key = keys[index];
    e.name = key;
    window.webContents.send('keydown', e);
  })
  uIOhook.on('keyup', (e) => {
    const index = values.indexOf(e.keycode);
    const key = keys[index];
    e.name = key;
    window.webContents.send('keyup', e);
  })

  uIOhook.on("wheel", e => {
    if (!isFocused) return;
    window.webContents.send("wheel", e);
  });

  uIOhook.start()

  ipcMain.on("focusWindow", async() => {


    const win = windowManager.getActiveWindow();
    gameProcessId = win.processId

    window.show();
    forceFocus.focusWindow(window);
      

  });


  ipcMain.on("blurWindow", () => {
    if (window.isDestroyed()) return;
    window.blur();
    
    processWindows.focusWindow({pid: gameProcessId})
  });


  ipcMain.on("setUsername", (e, username) => {
    store.set("username", username)
  })
  ipcMain.handle("getUsername", (e) => {
    return store.get("username");
  });

  ipcMain.on("setColor", (e, color) => {
    store.set("color", color);
  });
  ipcMain.handle("getColor", (e) => {
    return store.get("color");
  });

  ipcMain.on("setKeyBind", (e, keyBinds) => {
    store.set("keybinds", keyBinds);
  });
  ipcMain.handle("getKeyBind", (e) => {
    return store.get("keybinds");
  });



  ipcMain.on("setPos", (e, pos) => {
    const newPos = {...store.get("pos"), ...pos};
    store.set("pos", newPos);
    window.setPosition(newPos.x, newPos.y);
  });

  ipcMain.handle("getPos", (e) => {
    return store.get("pos");
  });



  ipcMain.on("exitOverlay", (e) => {
    app.exit(0);
  });
  ipcMain.on("setIp", (e, ip) => {
    store.set("ip", ip);
  });

  ipcMain.on("setIgnoreMouseEvents", (e, ignore) => {
    window.setIgnoreMouseEvents(ignore);
  });

  ipcMain.handle("getIp", (e) => {
    return store.get("ip");
  });
  ipcMain.handle("getCurrentPos", (e) => {
    return {
      x: window.getPosition()[0],
      y: window.getPosition()[1]
    }
  });




  window.on("focus", () => {
    isFocused = true;
    window.webContents.send("focused")
  })
  window.on("blur", () => {
    isFocused = false;
    window.webContents.send("blurred")
  })
  

  window.setIgnoreMouseEvents(true);

  const indexPath = path.join(__dirname, "render", "index.html");

  window.loadFile(indexPath);

  window.webContents.on("did-frame-finish-load", () => {
    window.setFocusable(true);
    window.setSkipTaskbar(true);
  })

}



app.whenReady().then(ready);