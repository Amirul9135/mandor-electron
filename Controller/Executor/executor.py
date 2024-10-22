import json
import pyautogui
import time
import sys
import threading
from Model.Macro import Macro
from Model.Command import Command
from Model.Condition import Condition

asyncConditions:list[Macro] = []
globalDelay = 0.1

def parseMacros(jsonObj):
    
    mainArray = []
    # jsonObj = json.loads(jsonstring)
    parseToMacroArray(jsonObj,mainArray)
    return mainArray


def parseToMacroArray(arr,macroArray:list,parent:Macro=None):
    for macro in arr:
        n = None
        if(macro['classCode'] == Macro.TYPE['CONDITION']): 
            n = Condition.fromJSON(macro)
        
        if(macro['classCode'] == Macro.TYPE['COMMAND']): 
            n = Command.fromJSON(macro)
        if(n):
            n.nodeId = macro['nodeId']
            if hasattr(n, 'asynch') and n.asynch: 
                asyncConditions.append(n)
            else:
                if(parent == None):
                    macroArray.append(n)
                else:
                    parent.childMacros.append(n)
                    
                if(macro.get('childMacros') is not None and isinstance(macro['childMacros'], list)):
                    parseToMacroArray(macro['childMacros'],macroArray,n)
 
def startAsyncConditions(conds:list[Macro]):
    for cond in conds:
        threading.Thread(target=runAsyncCondThread,args=cond).start()
def runAsyncCondThread(condition:Condition):
    while(1):
        toMain('eval','s')
        if(evalCondition(condition)):
            processMacros(condition.childMacros,True)
        time.sleep(globalDelay) 
        
def processMacros(macros:list[Macro], asynch = False):
    for macro in macros:
        time.sleep(globalDelay) 
        if not asynch :
            toMain('executing',macro.nodeId)
        else:
            toMain('async',macro.nodeId)
         
        if(macro.classCode ==  Macro.TYPE['COMMAND']): 
            doCommand(macro) 
        if(macro.classCode ==  Macro.TYPE['CONDITION']):     
            if(evalCondition(macro)):
                processMacros(macro.childMacros,asynch)

def doCommand(macro:Command): 
    # print('docomand',macro.type,macro.key,Command.TYPE['KEYBOARD_PRESS'],macro.type == Command.TYPE['KEYBOARD_PRESS'])
    if(macro.type == Command.TYPE['DELAY']):
        # print('delaying')1    1
        time.sleep(macro.duration / 1000)
        
    if(macro.type == Command.TYPE['MOUSE_CLICK']):
        # print('click')
        pyautogui.moveTo(macro.coord['x'], macro.coord['y'])
        if(macro.key == Command.KEY['LMB']):
            pyautogui.click()
        if(macro.key == Command.KEY['RMB']): 
            pyautogui.rightClick()
            
    if(macro.type == Command.TYPE['KEYBOARD_PRESS']):
        # print('pressing',macro.key)
        # pyautogui.press(macro.key) 
        pyautogui.keyDown(macro.key)
        wait = 0.1
        if hasattr(macro, 'duration') and macro.duration:
            wait = int( macro.duration)
        time.sleep(wait / 1000)
        pyautogui.keyUp(macro.key)
            
    
    
    pass
def evalCondition(macro:Condition): 
    target = None
    val = None
    if(macro.type == Condition.TYPE['COLOR_AT_COORD']):
        r, g, b  = pyautogui.pixel(macro.value['coord']['x'], macro.value['coord']['y'])
        target = '#{:02x}{:02x}{:02x}'.format(r, g, b)
        val = macro.value['val']
        # print('target ', type(target), target)
        # print('val ', type(val), val)
        # print(macro.comparison,type(macro.comparison))
        if (macro.comparison == Condition.COMPARE['IS_VALUE']):
            return val == target
        if (macro.comparison == Condition.COMPARE['IS_NOT_VALUE']):
            return val != target
        if (macro.comparison == Condition.COMPARE['IS_GREATER_THAN_VALUE']):
            return val > target
        if (macro.comparison == Condition.COMPARE['IS_GREATER_THAN_EQUAL_VALUE']):
            return val >= target
        if (macro.comparison == Condition.COMPARE['IS_LESS_THAN_VALUE']):
            return val < target
        if (macro.comparison == Condition.COMPARE['IS_LESS_THAN_EQUAL_VALUE']):
            return val <= target 


def main():
    dummystr = '[{"nodeId":"MC_0","classCode":0,"key":"tab","duration":"","type":"2","coord":null,"parent":null,"node":{}},{"nodeId":"MC_2","classCode":0,"key":"","duration":"2000","type":"10","coord":null,"parent":null,"node":{}},{"nodeId":"MC_3","classCode":1,"type":"0","comparison":4,"value":{"coord":{"x":565,"y":206},"val":"#812218"},"childMacros":[{"nodeId":"MC_4","classCode":0,"key":"1","duration":"","type":"2","coord":null,"parent":{},"node":{}},{"nodeId":"MC_5","classCode":0,"key":"","duration":"1000","type":"10","coord":null,"parent":{},"node":{}}],"parent":null,"node":{}}]'
    macros = parseMacros(dummystr)
    print(dummystr)
    print(macros)
    
    processMacros(macros)
    pyautogui.press('tab') 
    
    print('done')

def run(data):
    asyncConditions = []
    toMain('start',data)
    macros = parseMacros(data)
    
    startAsyncConditions(asyncConditions)
    
    while(1):
        processMacros(macros)

def toMain(path,data): 
    print(json.dumps({
        'path': path,
        'data':data
    }) + '\n')      
    sys.stdout.flush()
      
for line in sys.stdin: 
    try:
        obj = json.loads(line)
        if(obj['path'] == 'start'):
            run(obj['data'])
    except Exception as e:
        toMain('error',e)
        pass
 
