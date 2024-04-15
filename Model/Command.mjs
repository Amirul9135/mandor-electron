import { Macro } from "./Macro.mjs"

class Command extends Macro {
    static TYPE = {
        MOUSE_CLICK: 0,
        // MOUSE_MOVE:1,
        KEYBOARD_PRESS: 2,
        DELAY:10

    }
    static KEY = {
        LMB: 'LMB',
        LMB: 'RMB'
    }
    constructor(key, type, duration = 0, coord = null) {
        super()
        this.classCode = Macro.TYPE.COMMAND
        this.key = key
        this.duration = duration
        this.type = type
        this.coord = coord 
    }
    // toJSON(){
    //     return {
    //         key: this.key,
    //         type: this.type,
    //         duration: this.duration,
    //         coord: this.coord
    //     }
    // }

    label() {
        let lb = ((this.duration > 0) ? "Hold " + this.key + ' for ' + this.duration + ' miliseconds' : ((this.type == Command.TYPE.KEYBOARD_PRESS) ? 'Press ' : 'Click ') + this.key)
        if (this.coord != null) {
            lb += ' At (' + this.coord.x + ',' + this.coord.y + ')'
        }
        return lb
    }

    static MouseCommand(key,coord = {x:0,y:0}, duration = 0) {
        let cmd = new Command(key, Command.TYPE.MOUSE_CLICK, duration,coord)
        return cmd
    }

    static KeyboardCommand(key, duration = 0) {
        let cmd = new Command(key, Command.TYPE.KEYBOARD_PRESS, duration)
        return cmd
    }
}

export {
    Command
}