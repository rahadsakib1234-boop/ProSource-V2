/**
 * ProSource CRM - Electron Main Process
 * Handles window creation, IPC communication, and licensing
 */

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';
const appDataPath = app.getPath('userData');
const licenseFile = path.join(appDataPath, 'license.json');

/**
 * Create application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: isDev
  ? path.join(__dirname, 'preload.ts')
  : path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../public/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App event handlers
 */
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC Handlers for License Management
 */
ipcMain.handle('license:verify', async (event, token: string) => {
  try {
    // Verify license token (placeholder - implement actual verification)
    const isValid = verifyLicenseToken(token);
    if (isValid) {
      saveLicenseFile(token);
      return { valid: true, message: 'License verified successfully' };
    } else {
      return { valid: false, message: 'Invalid license token' };
    }
  } catch (err) {
    return { valid: false, message: err instanceof Error ? err.message : 'License verification failed' };
  }
});

ipcMain.handle('license:get', async () => {
  try {
    if (fs.existsSync(licenseFile)) {
      const data = fs.readFileSync(licenseFile, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.error('Error reading license:', err);
    return null;
  }
});

ipcMain.handle('license:clear', async () => {
  try {
    if (fs.existsSync(licenseFile)) {
      fs.unlinkSync(licenseFile);
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to clear license' };
  }
});

/**
 * IPC Handlers for File Operations
 */
ipcMain.handle('file:export', async (event, data: any, filename: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: filename,
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    }
    return { success: false, message: 'Export canceled' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Export failed' };
  }
});

ipcMain.handle('file:backup', async (event, data: any) => {
  try {
    const backupDir = path.join(appDataPath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    return { success: true, path: backupPath };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Backup failed' };
  }
});

/**
 * License verification (placeholder implementation)
 */
function verifyLicenseToken(token: string): boolean {
  // TODO: Implement actual license verification with cryptographic signing
  // For now, accept any non-empty token
  return token && token.length > 0;
}

function saveLicenseFile(token: string) {
  const licenseData = {
    token,
    activatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(licenseFile, JSON.stringify(licenseData, null, 2));
}

/**
 * Application Menu
 */
const template: any[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About ProSource CRM',
        click: () => {
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'About ProSource CRM',
            message: 'ProSource CRM v2.0.0',
            detail: 'A professional CRM solution for sourcing businesses',
          });
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
