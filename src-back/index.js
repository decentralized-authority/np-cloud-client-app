const path = require('path');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');
const { app, screen, BrowserWindow } = require('electron');

const serveDir = !isDev ? serve({directory: path.resolve(__dirname, '../build')}) : null;

const init = async function() {
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  const appWindow = new BrowserWindow({
    backgroundColor: '#14171a',
    width: width - 200,
    minWidth: 1280,
    height: height - 200,
    minHeight: 800,
    show: false,
    webPreferences: {
      webSecurity: false,
      preload: path.resolve(__dirname, '../public/api.js'),
    }
  });
  appWindow.once('ready-to-show', () => {
    appWindow.show();
  });
  if(isDev) {
    appWindow.toggleDevTools();
    await appWindow.loadURL('http://localhost:3000');
  } else {
    serveDir(appWindow)
      .catch(err => {
        console.error(`'serveDir error: ${err.message} \n ${err.stack}`);
      });
  }
};

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', init);
