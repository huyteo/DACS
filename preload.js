const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getDisplayMedia: (constraints) => navigator.mediaDevices.getDisplayMedia(constraints)
});
