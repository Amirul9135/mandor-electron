import {Macro} from "./Macro.mjs"
import {Condition} from "./Condition.mjs"
class Loop extends Macro{
    constructor(condition){
        super()
        this.classCode = Macro.TYPE.LOOP
        this.condition = condition
        this.condition.value.counter = this
        this.counter = 0
        this.childMacros = []
    }
    child(){
        return this.childMacros
    }

    label(){
        return  'Repeat until ' + this.condition.label()
    }

    count(){
        return this.counter
    }
}

export {
    Loop
}