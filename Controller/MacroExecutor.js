const { spawn } = require('child_process'); 

class MacroExecutor{
    static STATE = {
        STOP: 0,
        RUN:1,
        PAUSE:2
    }


    constructor(channel = null){
        this.macros = []
        this.state = 0
        this.channel = channel //a function which receive 1 arguments which message will be sent to 
        this.executor = null
    }

    setMacro(macros){
        this.macros.length = 0 
        this.macros.push(...macros) 
    }
    _notify(args){
        console.log('notify',args)
        if(this.channel){
            this.channel(args)
        }
    }
    _toExecutor(path,data){
        this.executor.stdin.write(JSON.stringify({
            path:path,
            data:data
        }) + '\n')
    }
    run(){  
        console.log('try run') 
        this.executor = spawn('C:\\Users\\nitor\\AppData\\Local\\Programs\\Python\\Python312\\python.exe', ['./Controller/Executor/executor.py']);
        console.log('run') 
        // Listen for data from the Python process
        this.executor.stdout.on('data', (data) => {
            console.log('received ',data)
            try {
                
                console.log(`Received from Python: ${data.toString().trim()}`)
                this._notify(data.toString().trim());
            } catch (error) {
                console.log(error)
            }
             
        });
        
        // Listen for errors from the Python process
        this.executor.stderr.on('data', (data) => {
            console.log(`Error from Python: ${data}`);
            this._notify(data.toString().trim());
        });
        
        // Listen for the Python process to exit
        this.executor.on('close', (code) => {
            try {
                
                console.log(`Python process exited with code ${code}`);
                this._notify(code.toString().trim());
            } catch (error) {
                
            }
        });
         
        this._toExecutor('start',this.macros)
    }  

    stop(){
        if(this.executor){
            this.executor.kill()
            this.executor = null
        }
    }


}
module.exports = {
    MacroExecutor
}
// export {
//     MacroExecutor
// }
