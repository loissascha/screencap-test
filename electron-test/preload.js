const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    mediaDevices: {
        getDisplayMedia: (constraints) =>
            navigator.mediaDevices.getDisplayMedia(constraints),
    },
});
