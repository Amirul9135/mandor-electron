class Macro{
    static TYPE = {
        COMMAND :0,
        CONDITION: 1,
        LOOP: 2
    } 
    static canBeParent(macro){
        let res = false
        try {
            let cname = ''
            if( typeof macro === 'string'){
                cname = macro
            }else{
                cname = macro.constructor.name
            }
            if(cname == "Condition" || cname == "Loop"){
                return true
            }
        } catch (error) {
            
        }
        return res
    }
    constructor(){ 

    }
    label(){
        throw new Error('Abstract method label must be implemented in inheriting concrete class');
    } 
    child(){
        throw new Error('Abstract method label must be implemented in inheriting concrete class');

    }
}

export {
    Macro 
}