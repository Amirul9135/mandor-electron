const {contextBridge, ipcRenderer} = require('electron')  
// const promiseIpc = require('electron-promise-ipc/preload');

// window.promiseIpc = promiseIpc;


contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toMain","mouse-capture","key-capture"];
            if (validChannels.includes(channel)) { 
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain","mouse-capture","key-capture"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        clearListener: (channel)=>{
            ipcRenderer.removeAllListeners(channel)
        }
    }
);


// contextBridge.exposeInMainWorld(
//     "pipc", { 
//     }
// );