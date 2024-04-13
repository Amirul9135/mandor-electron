const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path')
const robot = require('robotjs')
const isDev = process.env.NODE_ENV !== 'production'
const fs = require('fs');
const { promisify } = require('util');
const open = promisify(fs.open);

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

        
        electronLocalshortcut.register(this.window, 'Escape', () => {  
            this.stopMouseCapture()
        })
        electronLocalshortcut.register(this.window, '', () => {  
            console.log('anykey')
        })

        ipcMain.on('mouse-capture',(event,args)=>{
            if(args['path'] == 'start') {
                this.startMouseCapture(args)
            }
            if(args['path'] == 'stop') {
                this.stopMouseCapture(args)
            } 
        })
        ipcMain.on('key-capture',(event,args)=>{
            this.captureKeyOnce(args)
        })
        
        ipcMain.on("macro-file", async (event, args) => {
            console.log('macroFile',args)
            if(args['path']=="save"){
                let success = true
                try { 
                    args['fname'] = path.join(__dirname,'..','..','data',args['fname'] )
                    await this.saveMacro(args)
                } catch (error) {
                    console.log(error)
                    success = false
                }
                    
                this.window.webContents.send("macro-file", {
                    path: args['path'], data: success
                }); 
            }
        });
    }

    saveMacro(args){
        fs.access(args['fname'], fs.constants.F_OK, (err) => {
            if (err) {
                // File does not exist, create it
                fs.writeFile(args['fname'], '', (err) => {
                    if (err) throw err;
                    console.log(`File '${args['fname']}' created.`);
                    // Open the file for reading and writing
                    return this._openAndWriteFile(args);
                });
            } else {
                // File exists, open it
                return this._openAndWriteFile(args);
            }
        });
    }

    async _openAndWriteFile(data){  
        let fd = await open(data['fname'], 'r+');
        console.log(`File '${data['fname']}' opened.`); 
        fs.writeFile(data['fname'], data['data'], err => {
            if (err) {
              console.error(err);
              throw new Error('failed to write')
            } else {
              // file written successfully
            }
          });
        console.log(`Data written`); 
    }

    async captureKeyOnce(args) { 
        let key = await this._captureKeyPress()
        key = {pressed:key}
        console.log('capture key once', key)
        this.window.webContents.send("key-capture", {
            path: args['path'], data: key
        }); 
    }

    startMouseCapture(args){

        console.log('start capture')
        if(!this.capturingMouse){

            this.capturingMouse = setInterval(() => {
                this.window.webContents.send("mouse-capture", {
                    path: args['path'], data: this._captureMouse()
                }); 
            }, 100);
            
            electronLocalshortcut.register(this.window, 'F1', () => { 
                console.log('F1')
                electronLocalshortcut.unregister(this.window, 'F1'); 
                let data = this._captureMouse()
                
                if(this.capturingMouse){
                    clearInterval(this.capturingMouse)
                    this.capturingMouse = null
                }

                this.window.webContents.send("mouse-capture", {
                    path: 'snap', data: data
                }); 
            })
        } 
    }

    stopMouseCapture(args){ 
        console.log('stop capture')
        if(this.capturingMouse){
            clearInterval(this.capturingMouse)
            this.capturingMouse = null
            this.window.webContents.send("mouse-capture", {
                path: 'stop', data: null
            }); 
        }
    } 

    _captureMouse(){
        let coord = robot.getMousePos()
        let color = robot.getPixelColor(coord.x, coord.y)
        console.log({
            coord: coord,
            color: color
        })
        return{
            coord: coord,
            color: color
        }
    }

    _captureKeyPress(){
        
        process.stdin.setRawMode(true)
        return new Promise(resolve => process.stdin.once('data', () => {
            process.stdin.setRawMode(false)
            resolve()
        }))
    }
    actions(data) {

    }
}

module.exports = {
    MainScreen
}