const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startStream: (torrentId) => ipcRenderer.invoke('start-stream', torrentId),
    searchTPB: (query) => ipcRenderer.invoke('search-tpb', query),
    fetchYTS: (url) => ipcRenderer.invoke('fetch-yts', url)
});
