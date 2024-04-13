import {Macro} from "../../Model/Macro.js"
import {Command} from "../../Model/Command.js"
import {Condition} from "../../Model/Condition.js"
import {Loop} from "../../Model/Loop.js" 


//globals
const AllMacros = []
const currentMouse = {
    coord: {
        x:0,
        y:0
    },
    color: 'ffff'
}


// control buttons
const btnStart = document.querySelector('#btnStart')
const btnStop = document.querySelector('#btnStop')
const btnPause = document.querySelector('#btnPause')

// main layouts
const dvContent = document.querySelector('#dvContent')
const dvContextMenu = document.querySelector('#dvContextMenu') 

//=============Modal============
const dvModalMacro = document.querySelector('#modal_macro')

// selects
const selMacroType = document.querySelector('#selMacroType')
const selCommandType = document.querySelector('#selCommandType')

//type divs
const dvCommandType = document.querySelector('#commandType')
const dvConditionType = document.querySelector('#conditiontype')
const dvLoopType = document.querySelector('#loopType')

// COMMAND attributes
const dvCommandAtt = document.querySelector('#commandAtt')
const dvRadMouseClick = document.querySelector('#radMouseClick')
const radLeftClick = document.querySelector('#radLeftClick')
const radRightClick = document.querySelector('#radRightClick')
const inCmdKey = document.querySelector('#inCmdKey')
const inCoord = document.querySelector('#inCoord')
const inCoordLabel = document.querySelector('#inCoordLabel')
const inCommandDura = document.querySelector('#inCommandDura')


const dvLoopAtt = document.querySelector('#loopAtt')
const dvConditionAtt = document.querySelector('#conditionAtt')
//=============Modal End============

// context menu
const ctBtnAfer = document.querySelector('#ctBtnAfer')
const ctBtnBefore = document.querySelector('#ctBtnBefore')
const ctBtnInside = document.querySelector('#ctBtnInside')
const ctBtnRemove = document.querySelector('#ctBtnRemove')
// context menu end

//
//=============== Listeners ==================
//
window.addEventListener('load',(e)=>{
    Object.keys(Macro.TYPE).forEach(k=>{
        let opt = document.createElement("option");
        opt.value = Macro.TYPE[k]
        opt.innerHTML = k
        selMacroType.appendChild(opt)
    }) 
    Object.keys(Command.TYPE).forEach(k=>{
        let opt = document.createElement("option");
        opt.value = Command.TYPE[k]
        opt.innerHTML = k
        selCommandType.appendChild(opt)
    }) 
})
 
//=============== Macro Creation Listeners ================== 
inCoord.addEventListener('click',(e)=>{
    console.log('e')
    let tmp = e.target.value
    setCoordValue({x:1,y:2})

    window.api.send('toMain','test')
})

function setCoordValue(coord,capturing = true){
    if(capturing){ 
        inCoordLabel.innerHTML = 'Press F1 to Capture'
    }
    else{
        inCoordLabel.innerHTML = 'Coordinate'
        inCoord.dataset.actual = coord.toString()
    }
    inCoord.value = '('+coord.x+','+coord.y+')'
    
}

selCommandType.addEventListener('change',(e)=>{
    console.log(e.target.value)
    let type = parseInt(e.target.value)
    
    inCmdKey.parentElement.style.display = "none"
    inCommandDura.parentElement.style.display = "none"
    inCoord.parentElement.style.display = "none" 
    dvRadMouseClick.style.display = "none"

    switch(type){
        case Command.TYPE.KEYBOARD_PRESS:
            inCmdKey.parentElement.style.display = "block"
            inCommandDura.parentElement.style.display = "block"
            break;
        case Command.TYPE.MOUSE_CLICK: 
            dvRadMouseClick.style.display = "block"
            inCoord.parentElement.style.display = "block"
            inCommandDura.parentElement.style.display = "block"
            break;

        case Command.TYPE.DELAY:
            inCommandDura.parentElement.style.display = "block"
            break;
    }
})
selMacroType.addEventListener('change',(e)=>{
    console.log(e.target.value)
    dvCommandType.style.display = 'none'
    dvCommandAtt.style.display = 'none'

    dvConditionType.style.display = 'none'
    dvConditionAtt.style.display = 'none'

    dvLoopType.style.display = 'none'
    dvLoopAtt.style.display = 'none'

    if(e.target.value == Macro.TYPE.COMMAND){
        dvCommandType.style.display = 'block'
        dvCommandAtt.style.display = 'block'
    }
    if(e.target.value == Macro.TYPE.LOOP){
        dvLoopType.style.display = 'block'
        dvLoopAtt.style.display = 'block'
    }
    if(e.target.value == Macro.TYPE.CONDITION){
        dvConditionType.style.display = 'block'
        dvConditionAtt.style.display = 'block'
    }
})


//=============== Content panel Listeners ================== 
dvContent.addEventListener('click',(e)=>{
    console.log('dv content')
    $(dvModalMacro).modal('show');
    // add first macro sni
    let n = Command.KeyboardCommand('F') 
    AllMacros.push(n)
    refreshMacroDisplay()
})
// add after


//=============== Context Menu Listeners ================== 
ctBtnAfer.addEventListener('click', (e)=>{
    let curr = getSelectedMacro()
    console.log('current',curr)
    createNewMAcro()
    let n = Command.KeyboardCommand('A') 
    if(curr.parent){
        let pmacro = findMacroByNodeId(AllMacros,curr.parent.id)
        let curIdx = pmacro.child().indexOf(curr) +1
        pmacro.child().splice(curIdx, 0, n);
    }
    else{
        let curIdx = AllMacros.indexOf(curr) +1
        AllMacros.splice(curIdx, 0, n);
    }
    refreshMacroDisplay()
})

dvContent.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    let target = e.target 
    if(e.target.tagName == "P"){
        target = e.target.parentElement
    }
    clearSelection();
    target.classList.add('selected')
    if(Macro.canBeParent(target.dataset.model )){
        ctBtnInside.classList.remove('disabled')
         
    }
    else{ 
        ctBtnInside.classList.add('disabled')
    }
    dvContextMenu.style.display = 'block';
    dvContextMenu.style.left = e.clientX + 'px';
    dvContextMenu.style.top = e.clientY + 'px'; 

}) 

document.addEventListener('click',(e)=>{ 
    if(!dvContextMenu.contains(e.target)){
        dvContextMenu.style.display = 'none'; 
        clearSelection();
        console.log('out of context click')
    }
}) 

// add before

ctBtnBefore.addEventListener('click', (e)=>{
    let curr = getSelectedMacro()
    console.log('current',curr)
    let n = Command.KeyboardCommand('B') 
    if(curr.parent){
        let pmacro = findMacroByNodeId(AllMacros,curr.parent.id)
        let curIdx = pmacro.child().indexOf(curr) 
        pmacro.child().splice(curIdx, 0, n);
    }
    else{
        let curIdx = AllMacros.indexOf(curr) 
        AllMacros.splice(curIdx, 0, n);
    }
    refreshMacroDisplay()
})


ctBtnInside.addEventListener('click', (e)=>{
    let curr = getSelectedMacro()
    console.log('current',curr)
    let n = Command.KeyboardCommand('I') 
    if(!Macro.canBeParent(curr)){
        return
    }  
    curr.child().push(n)
    refreshMacroDisplay()
    
})
ctBtnRemove.addEventListener('click', (e)=>{
    let curr = getSelectedMacro() 
    let tmp = [...AllMacros];
    tmp = removeSpecificMacro(tmp,curr.node.id)
    AllMacros.length = 0
    AllMacros.push(...tmp)
    refreshMacroDisplay()
})


//=============== Main Controls Listeners ================== 
btnStart.addEventListener('click',(e)=>{
    dummy(e)
})
btnStop.addEventListener('click',(e)=>{
    dummy(e)
})
btnPause.addEventListener('click',(e)=>{
    dummy(e)
})

const Listeners = {}
Listeners['main/mouseCapture'] = setCurrentMouse
window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`);
    if(data['path']){
        Listeners[data['path']](data)
    }
});

//
//=============== Listeners End ==================
//

function setCurrentMouse(args,resolve){
    return new Promise((resolve,reject)=>{ 
    })
} 


function clearSelection(){
    document.querySelectorAll('.selected').forEach(e=>{
        e.classList.remove('selected')
    })
}


function createNewMAcro(){
    
    $(dvModalMacro).modal('show');
}
function dummy(e){ 
    let cd = new Condition(Condition.TYPE.COLOR_AT_COORD,Condition.COMPARE.IS_NOT_VALUE,{val:100,coord:{x:1,y:1}})
    cd.child().push( Command.KeyboardCommand('D') )
    cd.child().push( Command.KeyboardCommand('B') )
    cd.child().push( Command.KeyboardCommand('C') ) 

    let cdl = new Condition(Condition.TYPE.NUMBER,Condition.COMPARE.IS_NOT_VALUE,{val:100})
    let lp = new Loop(cdl)
    lp.child().push( Command.MouseCommand('B') )
    

    AllMacros.push( Command.KeyboardCommand('z') )
    AllMacros.push(cd) 
    AllMacros.push(lp) 
    AllMacros.push( Command.KeyboardCommand('x') )
    populateMacroDiv(AllMacros)  
    window.api.send('toMain','test')
}
 
function refreshMacroDisplay(){
    dvContent.innerHTML = ''
    populateMacroDiv(AllMacros) 
    dvContextMenu.style.display = 'none'; 
    clearSelection();
}

var spawnCount = 0
function spawnNewMacroDiv(macro,parent = null, padding = 0){
    let newDiv = document.createElement("div");
    newDiv.classList.add('macro')

    let newP = document.createElement("p"); 
    newP.innerHTML = macro.label()
    newP.style.paddingLeft = padding + 'px'
    newDiv.appendChild(newP) 
    
    newDiv.dataset.model = macro.constructor.name
    macro.parent = parent
    if(!macro.node){
        macro.node = newDiv
        newDiv.id="MC_"+ spawnCount 
        spawnCount++
    }
    else{
        newDiv.id=macro.node.id
        macro.node = newDiv
    }
    
    if(parent){
        parent.appendChild(newDiv)
    }else{
        dvContent.appendChild(newDiv)
    }
    return newDiv
}

function populateMacroDiv(macros,parent = null,padding = 0){ 
    macros.forEach(mc => {  
        let dv = spawnNewMacroDiv(mc,parent, padding)
        try {
            
            if(Array.isArray(mc.child())){
                populateMacroDiv(mc.child(),dv,padding + 15)
            }
        } catch (error) {
            
        }

    });
}
function removeSpecificMacro(macros,nodeIdToRemove){
    console.log(nodeIdToRemove,'remove?',macros)
    macros = macros.filter(mc => {
        console.log(mc, mc.node.id !== nodeIdToRemove)
        return mc.node.id !== nodeIdToRemove
    });
    console.log('afterin',macros)
    macros.forEach(mc => {
        try {
            
            if(Array.isArray(mc.child())){ 

                mc.childMacros = removeSpecificMacro(mc.child(),nodeIdToRemove) 
            }
        } catch (error) {
            
        }
    });
    return macros
}

function findMacroByNodeId(macros,id){
    for(let i=0;i < macros.length; i ++){
        console.log('finding',id,macros[i])
        if(macros[i].node.id == id){
            return macros[i]
        }
        try {
            
            if(Array.isArray(macros[i].child())){ 

                let f = findMacroByNodeId(macros[i].child(),id) 
                if(f){
                    return f
                }
            }
        } catch (error) {
            
        }
    }
    return null
}
function getSelectedMacro(){
    let index = -1
    let macros = document.querySelectorAll('.macro')
    for(let i=0; i < macros.length;i++){
        if(macros[i].classList.contains('selected')){
            index = i
            break;
        }
    }
    if(index == -1){
        console.log('no selected macro')
    }
    console.log('found',macros[index].id,macros[index])
    let found =  findMacro(AllMacros,macros[index].id)
    console.log('found macro',found)
    return found
}

function findMacro(macros,nodeId){ 
    for(let i =0; i < macros.length; i ++){ 
        try {  
            if(macros[i].node.id == nodeId){
                return macros[i]
            }
            else{ 
                if(Array.isArray(macros[i].child())){
                    let cont = findMacro(macros[i].child(),nodeId)
                    if(cont){
                        return cont
                    }
                }
            } 
        } catch (error) {
            
        }
    } 
    return null
}
// function traceCurrentSelectedMacro(){
//     let targetI = getSelectedIndex()
//     if(targetI < 0){
//         console.log('no selected macro')
//         return
//     }
//     let counter = {i:0,target:targetI}  
//     return traceMacro(AllMacros,counter)
// }

// function getSelectedIndex(){
//     let id = -1
//     document.querySelectorAll('.macro').forEach((element, index)=>{
//         if(element.classList.contains('selected')){ 
//             id= index
//         }
//     })  
//     return id
// }

// function traceMacro(macros,counter,parent = null){ //   current: macros[i], parent: parent, index: i 
//     for(let i =0; i < macros.length; i ++){ 
//         try {
//             if(counter.i == counter.target){
//                 return {
//                     current: macros[i],
//                     parent: parent,
//                     index: i 
//                 }
//             }
//             else{
//                 counter.i += 1
//                 if(Array.isArray(macros[i].child())){
//                    let cont = traceMacro(macros[i].child(),counter, macros[i])
//                    if(cont){
//                         return cont
//                    }
//                 }
//             } 
//         } catch (error) {
            
//         }
//     } 
//     return null
// }