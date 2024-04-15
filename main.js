const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path')
const robot = require('robotjs');
const { MainScreen } = require('./View/Main/MainScreen');
const preload = path.join(__dirname, 'preload.js') 
const isDev = process.env.NODE_ENV !== 'production'


//  "path/path" : function/handler
var Listeners = { 
} 
const menuTemplate = [
    // {
    //     label: 'File',
    //     submenu:[
    //         {
    //             label:'quit',
    //             click: ()=> app.quit(), 
    //         }
    //     ]
    // }
]

//windows
const windows = [] 
const MainWindow = new MainScreen(preload)

windows.push(MainWindow)

app.whenReady().then(() => {
    // createMainWindow();
    MainWindow.create() 
    // menu

    const mainenu = Menu.buildFromTemplate(menuTemplate) 
    Menu.setApplicationMenu(mainenu)
 
    
    
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        MainWindow.create()
    }
})
 