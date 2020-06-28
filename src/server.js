const {BrowserWindow, ipcMain} = require('electron');
const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
const app = express()
const port = 3000

app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'sender/index.html')))
app.post('/startShare', async (req, res) => {
  // Create receiver window
  const receiverWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  await receiverWin.loadFile(path.join(__dirname, 'receiver/index.html'));
  receiverWin.webContents.openDevTools();
  receiverWin.webContents.send('init', req.body);

  const replyPromise = new Promise((resolve, reject) => {
    ipcMain.once('initReply', (event, reply) => {
      resolve(reply);
    })
  })

  res.json(await replyPromise);
})

// TODO: Add HTTPS
app.listen(port, () => console.log(`Simple screen share listening at http://localhost:${port}`))