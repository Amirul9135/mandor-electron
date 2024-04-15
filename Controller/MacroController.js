import {Macro} from '../Model/Macro.mjs'
import {Command} from '../Model/Command.mjs'
import {Condition} from '../Model/Condition.mjs' 

class MacroController{
    static JOBJtoMacros(arr,macroArray,parent = null){ 
        console.log('onverting jobj to macros')
        arr.forEach(i=>{
            let n = null
            if(i.classCode == Macro.TYPE.COMMAND){
                n = new Command(i.key,i.type,i.duration,i.coord)
                
            }
            if(i.classCode == Macro.TYPE.CONDITION){
                n = new Condition(i.type,i.comparison,i.value)
            }
            if(n){
                n.nodeId = i.nodeId
                if(!parent){
                    macroArray.push(n)
                }
                else{
                    parent.childMacros.push(n)
                }
                if(Array.isArray(i.childMacros)){
                    MacroController.JOBJtoMacros(i.childMacros,macroArray,n)
                }
            }      
        })
    } 
}

export {
    MacroController
}