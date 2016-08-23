const request = require('request');
const querystring = require('querystring');

const CONSUMER_KEY = '';
const CONSUMER_SECRET = '';
const ACCESS_TOKEN_URL = 'https://www.someapi.org/access_token';
const AUTHORIZE_TOKEN_URL = 'https://www.someapi.org/authorize?oauth_token=';
const REQUEST_TOKEN_URL = 'https://www.someapi.org/request_token?oauth_callback=electroauth://storetoken';

//Checks if the access token is in local storage, if not, makes a request for it
function checkToken() {
  const {getCurrentWindow} = require('electron').remote;
  if (localStorage.getItem('token')){
    getCurrentWindow().loadURL(`file://${__dirname}/content.html`);
  } else {
    //the request module provides a way to make OAuth requests easily
    const oauth = {consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET};

    request.post({url: REQUEST_TOKEN_URL, oauth: oauth}, (e, r, body) => {
      const req_data = querystring.parse(body);
      document.getElementById('webview').setAttribute("src", AUTHORIZE_TOKEN_URL + req_data.oauth_token);
    });
  }
}

//gets the access token and stores it to local storage
function storeToken(urlQuery, targetWindow) {
  const verify_data = querystring.parse(urlQuery);

  const oauth = {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    token: verify_data.oauth_token,
    token_secret: verify_data.oauth_token_secret,
    verifier: verify_data.oauth_verifier,
  };

  request.post({url: ACCESS_TOKEN_URL, oauth: oauth}, (e, r, body) => {
    const token_data = querystring.parse(body);
    targetWindow.loadURL(`file://${__dirname}/content.html`);
    //Wait for the window to load to use local storage
    targetWindow.webContents.on('did-finish-load', () => {
      targetWindow.webContents.executeJavaScript(
        `localStorage.setItem('token', "${token_data.oauth_token}");
         localStorage.setItem('token_secret', "${token_data.oauth_token_secret}");`
      );
    });
  });
}
module.exports = {checkToken: checkToken, storeToken: storeToken};
