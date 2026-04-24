const { app, BrowserWindow, ipcMain } = require('electron')
// 1. SEMPRE a primeira coisa a rodar para gerenciar atalhos
if (require('electron-squirrel-startup')) app.quit();

const db = require('./database/connection.js')
const path = require('path')

// Importação dos IPCs
const ipcGasto = require('./ipc/gasto.ipc.js')
const ipcCategoria = require('./ipc/categoria.ipc.js')
const ipcVenda = require('./ipc/venda.ipc.js')
const ipcUsuario = require('./ipc/usuario.ipc.js')
const ipcDashboard = require('./ipc/dashboardResumo.ipc.js')
const ipcAuth = require('./ipc/auth.ipc.js')
const ipcLogs = require('./ipc/logs.ipc.js')

const { getSessao, setSessao } = require('./session')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    // DICA: No Windows, para o ícone da janela, o .png funciona, 
    // mas o .ico é o padrão mais estável.
    icon: path.join(__dirname, 'frontend', 'assets', 'icon-app.ico')
  })

  win.setMenu(null)
  win.loadFile('./frontend/login.html')
}

// 2. Evento de inicialização
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 3. Mova para FORA do whenReady: Garante que o processo encerre corretamente
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

module.exports = { getSessao, setSessao }