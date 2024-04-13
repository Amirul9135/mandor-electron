const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path')
const robot = require('robotjs')
const isDev = process.env.NODE_ENV !== 'production'

class MainScreen {
    constructor(preload) {
        this.window = null
        this.preload = preload
        this.capturingMouse = null
    }

    create() {
        this.window = new BrowserWindow({
            title: 'Mandor',
            width: isDev ? 1300 : 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
                preload: this.preload
            }
        });

        if (isDev) {
            this.window.webContents.openDevTools();
        }

        this.window.loadFile(path.join(__dirname, '..', 'index.html'))
    }

    startMouseCapture(args){
        if(!this.capturingMouse){
            this.capturingMouse = setInterval(() => {
                this.window.webContents.send("fromMain", {
                    path: args['path'], data: this._captureMouse()
                }); 
            }, 300);
        } 
    }

    stopMouseCapture(args){ 
        if(this.capturingMouse){
            clearInterval(this.capturingMouse)
        }
    }

    captureMouseOnKeyPress(args) {
        electronLocalshortcut.register(this.window, 'F1', () => { 
            electronLocalshortcut.unregister(this.window, 'F1'); 
            let data = this._captureMouse()
            console.log('captured',data)
            this.window.webContents.send("fromMain", {
                path: args['path'], data: data
            }); 
        })
    }

    _captureMouse(){
        let coord = robot.getMousePos()
        let color = robot.getPixelColor(coord.x, coord.y)
        return{
            coord: coord,
            color: color
        }
    }

    actions(data) {

    }
}

module.exports = {
    MainScreen
}