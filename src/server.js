const {BrowserWindow, ipcMain} = require('electron');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const app = express()
const port = 3000

app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'sender/index.html')))
app.post('/startShare', async (req, res) => {
  // Create receiver window
  const receiverWin = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  await receiverWin.loadFile(path.join(__dirname, 'receiver/index.html'));
  // receiverWin.webContents.openDevTools();
  receiverWin.webContents.send('init', req.body);

  const replyPromise = new Promise((resolve, reject) => {
    ipcMain.once('initReply', (event, reply) => {
      resolve(reply);
    })
  })

  res.json(await replyPromise);
})

// TODO: Generate certificates on-the-fly
const privateKey  = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'server.crt'), 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => console.log(`Simple screen share listening at https://localhost:${port}`))