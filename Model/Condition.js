import {Macro} from "./Macro.js" 

class Condition extends Macro{
    static TYPE = { //value format
        COLOR_AT_COORD: 0, // {val:colorhex,coord:{x,y}}
        NUMBER: 1 // {val:fixedToCompare,counter:object.count()} object yg expose counter via function int/float whatever
    }


    static COMPARE = {
        IS_GREATER_THAN_VALUE: Symbol("IS_GREATER_THAN_VALUE"),
        IS_GREATER_THAN_EQUAL_VALUE: Symbol("IS_GREATER_THAN_EQUAL_VALUE"),
        IS_LESS_THAN_VALUE: Symbol("IS_LESS_THAN_VALUE"),
        IS_LESS_THAN_EQUAL_VALUE: Symbol("IS_LESS_THAN_EQUAL_VALUE"),
        IS_VALUE: Symbol("IS_VALUE"),
        IS_NOT_VALUE: Symbol("IS_NOT_VALUE")
    } 
    static labels = {
        [Condition.COMPARE.IS_GREATER_THAN_VALUE]: ">",
        [Condition.COMPARE.IS_GREATER_THAN_EQUAL_VALUE]: ">=",
        [Condition.COMPARE.IS_LESS_THAN_VALUE]: "<",
        [Condition.COMPARE.IS_LESS_THAN_EQUAL_VALUE]: "<=",
        [Condition.COMPARE.IS_VALUE]: "==",
        [Condition.COMPARE.IS_NOT_VALUE]: "!="
    };

    constructor(type,comparison,value){
        super()
        this.type = type
        this.comparison = comparison
        this.value = value
        this.validateType()
        this.childMacros = []
    }
    child(){
        return this.childMacros
    }
    label(){
        let label = ''
        console.log('labeling',this.value,this.comparison)
        if (this.type == Condition.TYPE.NUMBER){
             
            label = 'IF ' + this.value.counter.count()
        }
        if (this.type == Condition.TYPE.COLOR_AT_COORD){
            label = 'IF color at (' + this.value.coord.x +','+this.value.coord.y + ')'
        }
        label += ' ' + Condition.labels[this.comparison] + ' ' + this.value["val"]
        return label
        
    }
    validateType(){
        let valid = true;
        try {
            if(!this.value.val){
                valid = false
            }
            if(this.type == Condition.TYPE.COLOR_AT_COORD){
                if(!this.value.coord.x || !this.value.coord.y){
                    valid = false
                }
            }
            if(this.type == Condition.TYPE.NUMBER){
                if(!this.value.counter.count()){
                    valid = false
                }
            }
        } catch (error) {
            valid = false
        }
        if(!valid){
            console.log("Condition value does not fit its type")
        }
        return valid
    }
}

export {
    Condition
}