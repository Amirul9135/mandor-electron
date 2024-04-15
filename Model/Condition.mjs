import {Macro} from "./Macro.mjs" 

class Condition extends Macro{
    static TYPE = { //value format
        COLOR_AT_COORD: 0, // {val:colorhex,coord:{x,y},tolerance:10}
        NUMBER: 1 // {val:fixedToCompare,counter:object.count()} object yg expose counter via function int/float whatever
    }


    static COMPARE = {
        IS_GREATER_THAN_VALUE: 0,
        IS_GREATER_THAN_EQUAL_VALUE: 1,
        IS_LESS_THAN_VALUE: 2,
        IS_LESS_THAN_EQUAL_VALUE: 3,
        IS_VALUE: 4,
        IS_NOT_VALUE: 5
    } 
    static labels = {
        '0': ">",
        '1': ">=",
        '2': "<",
        '3': "<=",
        '4': "==",
        '5': "!="
    };

    constructor(type,comparison,value){
        super()
        this.classCode = Macro.TYPE.CONDITION
        this.type = type
        this.comparison = comparison
        this.value = value
        this.validateType()
        this.childMacros = []
    }

    // toJSON(){
    //     return { 
    //         type: this.type,
    //         comparison: this.comparison,
    //         value: this.value
    //     }
    // }
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