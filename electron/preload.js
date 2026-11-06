'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// The only bridge the page gets: save a PNG through the native "Save As" dialog.
contextBridge.exposeInMainWorld('magicPaint', {
  desktop: true,
  platform: process.platform,
  savePNG: (name, arrayBuffer) => ipcRenderer.invoke('save-png', name, arrayBuffer)
});
