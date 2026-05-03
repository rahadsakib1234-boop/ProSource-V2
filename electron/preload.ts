/**
 * ProSource CRM - Electron Preload Script
 * Exposes safe IPC methods to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // License management
  license: {
    verify: (token: string) => ipcRenderer.invoke('license:verify', token),
    get: () => ipcRenderer.invoke('license:get'),
    clear: () => ipcRenderer.invoke('license:clear'),
  },

  // File operations
  file: {
    export: (data: any, filename: string) => ipcRenderer.invoke('file:export', data, filename),
    backup: (data: any) => ipcRenderer.invoke('file:backup', data),
  },

  // System info
  system: {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
