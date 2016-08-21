const {app, BrowserWindow, protocol} = require('electron');
const url = require('url');

//Registers a custom protocol scheme for the app (electroauth://)
protocol.registerStandardSchemes(['electroauth']);

let win;

function prepareApp() {
  win = new BrowserWindow({width: 600, height: 600});
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', () => {
    win = null;
  });

  //Handles the request for the access token callback
  protocol.registerStringProtocol('electroauth', (req, callback) => {
    if (url.parse(req.url).host === 'storetoken'){
      require('./auth').storeToken(url.parse(req.url).query, win);
    }
  });
}

app.on('ready', prepareApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    prepareApp();
  }
});
