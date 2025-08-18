/* eslint-disable no-unused-vars */
import process from 'process';

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { isDev } from './util.js';
// import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import fetch from 'node-fetch';

//This is where the api key is being injected from the env file
// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow;
let dev = isDev();

async function createWindow () {
  const preloadPath = path.join(__dirname, 'preload.js');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show the window until it's ready
    fullscreen: !dev,  // <-- start in fullscreen

    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Enable geolocation permissions
      permissions: ['geolocation'],
    }
  });

  // Show window when it's ready to reduce perceived loading time
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if(isDev()){
    await waitForVite("http://localhost:5173/");
    mainWindow.loadURL("http://localhost:5173/");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}
async function waitForVite(url, retries = 20, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(url);
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
}
// Initialize app when ready
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-hostname', async () => {
  return os.hostname();
});

// Handle orientation detection and screen division
ipcMain.handle('get-orientation-data', async () => {
  if (!mainWindow) {
    return { error: 'Window not available' };
  }
  
  const bounds = mainWindow.getBounds();
  const width = bounds.width;
  const height = bounds.height;
  
  // Determine orientation based on aspect ratio
  const isLandscape = width > height;
  
  return {
    isLandscape,
    width,
    height
  };
});

// Handle system time API
ipcMain.handle('get-system-time', async () => {
  const now = new Date();
  return {
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    timestamp: now.getTime()
  };
});



// Handle precise geolocation from renderer
ipcMain.handle('get-precise-location', async () => {
  try {
    const res = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ considerIp: true }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return {
      lat: data.location.lat,
      lon: data.location.lng,
      accuracy: data.accuracy,
      method: 'google-geolocation-api'
    };
  } catch (err) {
    return { error: err.message };
  }
});

