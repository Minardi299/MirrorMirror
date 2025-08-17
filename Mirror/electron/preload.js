//this has to be a common js file, otherwise the preload file will not work so just 
//ignore the eslint error
// eslint-disable-next-line no-undef
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getHostname: () => ipcRenderer.invoke('get-hostname'),
  getOrientationData: () => ipcRenderer.invoke('get-orientation-data'),
  onWindowResize: (callback) => ipcRenderer.on('window-resized', callback),
  getSystemTime: () => ipcRenderer.invoke('get-system-time'),
  getPreciseLocation: () => ipcRenderer.invoke('get-precise-location'),
});