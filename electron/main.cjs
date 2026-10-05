const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Load .env from the project root when present (dev only; .env is not packaged into the EXE)
const ENV_FILE = path.join(__dirname, '..', '.env');
if (fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const PORT = process.env.PORT || '5000';

let mainWindow = null;
let backendHandle = null;
let shuttingDown = false;

function dataDir() {
  const dir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function dbPath() { return path.join(dataDir(), 'qbt.db'); }
function logPath() { return path.join(app.getPath('userData'), 'qbt-backend.log'); }
function log(message) { try { fs.appendFileSync(logPath(), `[${new Date().toISOString()}] ${message}\n`); } catch (_) {} }

async function startBackend() {
  const target = dbPath();
  const bundled = path.join(__dirname, 'qbt.db');
  if (!fs.existsSync(target)) {
    if (!fs.existsSync(bundled)) throw new Error(`Bundled SQLite database not found: ${bundled}`);
    fs.copyFileSync(bundled, target);
  }
  process.env.QBT_DB_PATH = target;
  process.env.PORT = PORT;
  process.env.NODE_ENV = 'production';
  log(`Starting embedded backend. DB=${target}`);
  const backend = require(path.join(__dirname, '..', 'backend', 'server.cjs'));
  backendHandle = await backend.startServer();
  log(`Backend listening on http://127.0.0.1:${PORT}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700,
    backgroundColor: '#0f1115',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  // In development, point Electron at the Vite dev server for hot reload
  if (process.env.ELECTRON_START_URL) mainWindow.loadURL(process.env.ELECTRON_START_URL);
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  try { await startBackend(); createWindow(); }
  catch (error) {
    log(`Backend startup failed: ${error.stack || error}`);
    dialog.showErrorBox('QBT Backend Error', `${error.message}\n\nLog:\n${logPath()}`);
    app.quit();
  }
});

app.on('before-quit', (event) => {
  if (!backendHandle || shuttingDown) return;
  event.preventDefault();
  shuttingDown = true;
  Promise.resolve(backendHandle.close())
    .catch(() => {})
    .finally(() => {
      backendHandle = null;
      app.quit();
    });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
