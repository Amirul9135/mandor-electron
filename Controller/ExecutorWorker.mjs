
import { parentPort } from 'worker_threads';
import {Condition} from '../Model/Condition.mjs';
import {Command} from '../Model/Command.mjs';
import {Macro} from '../Model/Macro.mjs';
import robot from 'robotjs'

// Send a message to the parent thread when the worker starts
let dummystr = '[{"nodeId":"MC_0","classCode":0,"key":"tab","duration":"","type":"2","coord":null,"parent":null,"node":{}},{"nodeId":"MC_2","classCode":0,"key":"","duration":"5000","type":"10","coord":null,"parent":null,"node":{}},{"nodeId":"MC_1","classCode":1,"type":"0","comparison":4,"value":{"coord":{"x":365,"y":290},"val":"#1c1e26"},"childMacros":[{"nodeId":"MC_3","classCode":0,"key":"1","duration":"","type":"2","coord":null,"parent":{},"node":{}}],"parent":null,"node":{}}]'
let dummyObj = JSON.parse(dummystr)
var MACROS = [] 
JOBJtoMacros(dummyObj,MACROS) 
setTimeout(()=>{
    parentPort.postMessage('Worker thread started!');
    processMacros() 
},1000)

async function processMacros(macros){
    await macros.forEach(async (m)=>{
        console.log('performing command',m)
        if(m.classCode == Macro.TYPE.COMMAND){
            await doCommand(m)
        }
        if(m.classCode == Macro.TYPE.CONDITION){
            if(await evalCondition(m)){
                await processMacros(m.child())
            }
        }
    })
}
function evalCondition(macro){
    return new Promise((resolve,reject)=>{ 
        let target
        let val
        if(macro.type = Condition.TYPE.COLOR_AT_COORD){
            target = robot.getPixelColor(macro.value.coord.x,macro.value.coord.y)
            val = macro.value.val
        }
        
        switch(macro.comparison){
            case Condition.COMPARE.IS_VALUE:
                return resolve(val == target); 
            case Condition.COMPARE.IS_NOT_VALUE:
                return resolve(val != target);
            case Condition.COMPARE.IS_GREATER_THAN_VALUE:
                return resolve(val > target);
            case Condition.COMPARE.IS_GREATER_THAN_EQUAL_VALUE:
                return resolve(val >= target);
            case Condition.COMPARE.IS_LESS_THAN_VALUE:
                return resolve(val < target);
            case Condition.COMPARE.IS_LESS_THAN_EQUAL_VALUE:
                return resolve(val <= target);
        }
    }) 
}
function doCommand(macro){
    return new Promise((resolve,reject)=>{
        if(macro.type == Command.TYPE.DELAY){
            setTimeout(()=>{
                resolve()
            },macro.duration)
        }
        if(macro.type == Command.TYPE.MOUSE_CLICK){
            
            robot.moveMouse(macro.coord.x, macro.coord.y);
            let button = (macro.key == Command.KEY.LMB) ? 'left' : 'right';
            robot.mouseClick(button);

            return resolve();
        }
        if(macro.type == Command.TYPE.KEYBOARD_PRESS){

            robot.keyTap(macro.key);
            return resolve()
        }
    })
}
 
// import {workerData,parentPort} from 'worker_threads'
// // console.log('worker')
// parentPort.postMessage({ hello: 'im alive' })
// import {Macro} from '../Model/Macro.mjs';
// import {Condition} from '../Model/Condition.mjs';
// import {Command} from '../Model/Command.mjs';
// import {Loop} from '../Model/Loop.mjs';
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// parentPort.postMessage({ hello: 'im alive' })
// parentPort.postMessage('ui')

 
// try {
//     let dummystr = '[{"nodeId":"MC_0","classCode":0,"key":"tab","duration":"","type":"2","coord":null,"parent":null,"node":{}},{"nodeId":"MC_2","classCode":0,"key":"","duration":"5000","type":"10","coord":null,"parent":null,"node":{}},{"nodeId":"MC_1","classCode":1,"type":"0","comparison":4,"value":{"coord":{"x":365,"y":290},"val":"#1c1e26"},"childMacros":[{"nodeId":"MC_3","classCode":0,"key":"1","duration":"","type":"2","coord":null,"parent":{},"node":{}}],"parent":null,"node":{}}]'
//     let dummyObj = JSON.parse(dummystr)
//     parentPort.postMessage({ hello: 'im alive' })
//     // console.log('workerdata sinis',workerData) 
//     // console.log('aik')
//     var MACROS = []
//     // console.log('aik')
//     // JOBJtoMacros(workerData.macros,MACROS)
//     JOBJtoMacros(dummyObj,MACROS)
//     log("Macros to Execute",MACROS)
// } catch (error) {
//     log(error)
//     console.log(error)
// } 

// // var loop = new Promise((resolve,reject)=>{
// //     while(1){

// //     }
// // })
// const current = {
//     macro: null, 
// } 
// function processMacros(arr){ //
//     return new Promise((resolve,reject)=>{ 
//         for(let i = 0; i < arr.length;i++){
//             //do process
//             // console.log(arr[i].label)
//             current.macro = arr[i]
//             delay(100)
//             if(Array.isArray(arr[i].childMacros)){
//                 processMacros(arr[i].childMacros)
//             }
//         } 

//     })
// }

function JOBJtoMacros(arr,macroArray,parent = null){ 
    log('onverting jobj to macros')
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
                JOBJtoMacros(i.childMacros,macroArray,n)
            }
        }      
    })
} 

function log(data){
    parentPort.postMessage(data)
} 