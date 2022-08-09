const { uIOhook, UiohookKey } = require('uiohook-napi');
const forceFocus = require('forcefocus');
const {BrowserWindow, app, globalShortcut} = require("electron");
const path = require("path");
const { ipcMain } = require('electron')
const processWindows = require("node-process-windows");




const ready = () => {


  let valProcess = null

  processWindows.getProcesses(function(err, processes) {
    processes.forEach(function (p) {
        if (p.processName === "VALORANT-Win64-Shipping") {
          valProcess = p;
            console.log("VALORANT is running");
        }
    });
  });

  const window = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    skipTaskbar: true,
    x: 10,
    // y: 450,
    y: 200,
    transparent: true,
    alwaysOnTop: true,

    
    webPreferences: {
      preload: path.join(__dirname, "render",'preload.js'),
    },
  });

  const values = Object.values(UiohookKey);
  const keys = Object.keys(UiohookKey);

  uIOhook.on('keydown', (e) => {
    const index = values.indexOf(e.keycode);
    const key = keys[index];
    e.name = key;
    window.webContents.send('keydown', e);
  })
  uIOhook.start()

  ipcMain.on("focusWindow", () => {
    window.show();
    // try {
      forceFocus.focusWindow(window);
    // } catch(e) {
    //   console.log(e)
    // }
  });


  ipcMain.on("blurWindow", () => {
    window.blur();
    window.focus();

    processWindows.focusWindow(valProcess)


  });

  window.on("focus", () => {
    window.webContents.send("focused")
  })
  window.on("blur", () => {
    window.webContents.send("blurred")
  })
  

  window.setIgnoreMouseEvents(true);

  const indexPath = path.join(__dirname, "render", "index.html");

  window.loadFile(indexPath);




}

app.whenReady().then(ready);